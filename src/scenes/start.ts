// Course 2, `start` — the first file. Every editor, transcript and picture is read from the spine.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, linesOf, session, shot, tree } from '../spine'
import { ide } from './ide'
import { opener } from './opener'

const S = (n: string) => `start/${n}`

// ── 0 · recap ────────────────────────────────────────────────────────────────────────────────
const recap = opener({
  course: 'start',
  before: [{ course: '1 intro', ts: 'JavaScript plus types: tsc checks them, Node erases them, V8 runs what is left', can: 'nothing yet: it is a plan' }],
  now: { type: 'item', id: 'empty', icon: 'folder', title: '~/miniflow', sub: 'an empty folder: no file, no package, no box' },
  question: 'How does a .ts file run, and who checks it?',
  adds: ['Node and npm make the folder a package', 'main.ts draws the first box', 'tsc checks what Node only runs'],
})

// ── 1 · Node, npm and a folder ───────────────────────────────────────────────────────────────
const pkg = file(S('01-init'), 'package.json')
const node: SceneModel = ide({
  model: 'Node carries V8; npm talks to the registry',
  variant: 'code',
  explorer: tree(S('01-init'), { active: 'package.json', added: ['package.json'] }),
  editor: { filename: 'package.json', lang: 'js', code: pkg, highlight: [lineOf(pkg, '"type"')] },
  session: session(S('01-init')),
  side: [
    { type: 'group', id: 'nodejs', title: 'node', sub: grab(session(S('01-init')), /^(v\d+\.\d+\.\d+)$/m), icon: 'cpu', tone: 'infra', children: [
      { type: 'item', id: 'v8', title: 'V8', sub: 'runs JavaScript' },
      { type: 'item', id: 'stdlib', title: 'the standard library', sub: 'node:fs, node:path, node:http…' },
    ] },
    { type: 'group', id: 'npmg', title: 'npm', sub: grab(session(S('01-init')), /^(\d+\.\d+\.\d+)$/m), icon: 'package', tone: 'store', dir: 'row', children: [
      { type: 'item', id: 'pkgjson', title: 'package.json', sub: 'name, scripts, "type"' },
      { type: 'item', id: 'registry', icon: 'globe', title: 'the registry', sub: 'npmjs.com' },
    ] },
  ],
  edges: [{ from: 'pkgjson', to: 'registry', label: 'install' }],
})

// ── 2 · main.ts draws one box ────────────────────────────────────────────────────────────────
const main2 = file(S('02-main'), 'main.ts')
const main: SceneModel = ide({
  model: 'Node strips the types, then runs',
  variant: 'run',
  explorer: tree(S('02-main'), { active: 'main.ts', added: ['main.ts', 'out/box.svg'] }),
  editor: { filename: 'main.ts', code: main2, show: [[lineOf(main2, 'type Box'), lineOf(main2, 'const h')]], highlight: [lineOf(main2, 'type Box'), lineOf(main2, 'const box'), lineOf(main2, 'const pad')] },
  output: { src: shot(S('02-main'), 'out/box.svg'), title: 'out/box.svg', alt: 'the one box main.ts drew' },
  side: [
      { type: 'item', id: 'ts', icon: 'file', title: 'main.ts', sub: 'JavaScript + types' },
      { type: 'item', id: 'strip', icon: 'cpu', tone: 'infra', title: 'Node strips the types', sub: 'replaced by spaces, nothing checked' },
      { type: 'item', id: 'v8run', icon: 'zap', tone: 'infra', title: 'V8 runs the JavaScript', sub: 'node:fs writes the file' },
      { type: 'item', id: 'svg', icon: 'file', tone: 'serve', title: 'out/box.svg', sub: `${grab(session(S('02-main')), /: (\d+ × \d+)/)}: one box` },
  ],
  edges: [{ from: 'ts', to: 'strip' }, { from: 'strip', to: 'v8run' }, { from: 'v8run', to: 'svg' }],
})

// ── 3 · ◆ where the types go (lab: tsc's emit beside the source) ─────────────────────────────
const emitSrc = file(S('03-emit'), 'main.ts'), emitJs = file(S('03-emit'), 'emit/main.js')
const emit: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'pipeline', title: 'one file, two jobs', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'src', icon: 'file', title: 'main.ts', sub: 'JavaScript + types' },
      { type: 'group', id: 'jobs', bare: true, dir: 'row', children: [
        { type: 'item', id: 'check', icon: 'search', tone: 'serve', title: 'tsc checks', sub: 'errors or silence' },
        { type: 'group', id: 'run', bare: true, children: [
          { type: 'item', id: 'erase', icon: 'cpu', tone: 'infra', title: 'Node erases', sub: 'or tsc emits' },
          { type: 'item', id: 'js', icon: 'file', title: 'JavaScript', sub: 'every type removed' },
          { type: 'item', id: 'v8', icon: 'zap', tone: 'infra', title: 'V8', sub: 'runs it, knowing no types' },
        ] },
      ] },
    ] },
    { type: 'group', id: 'files', bare: true, children: [
      { type: 'code', id: 'before', fill: true, filename: 'main.ts', lang: 'ts', code: emitSrc, show: [[1, lineOf(emitSrc, 'const h')]], highlight: [lineOf(emitSrc, 'type Box'), lineOf(emitSrc, 'const box'), lineOf(emitSrc, 'const pad')] },
      { type: 'code', id: 'after', fill: true, filename: 'emit/main.js', lang: 'js', code: emitJs, show: [[1, lineOf(emitJs, 'const h')]] },
      { type: 'code', id: 'cmd', fill: true, console: true, cols: 72, filename: 'terminal — miniflow', code: session(S('03-emit')) },
    ] },
  ],
  edges: [{ from: 'src', to: 'check' }, { from: 'src', to: 'erase' }, { from: 'erase', to: 'js', label: 'leaves' }, { from: 'js', to: 'v8', label: 'runs' }],
}

// ── 4 · tsc and tsconfig.json ────────────────────────────────────────────────────────────────
const cfg4 = file(S('04-tsc'), 'tsconfig.json')
const tsc: SceneModel = ide({
  model: 'tsc reads tsconfig, checks every file',
  variant: 'code',
  explorer: tree(S('04-tsc'), { active: 'tsconfig.json', added: ['tsconfig.json', 'package-lock.json'], modified: ['package.json'] }),
  editor: { filename: 'tsconfig.json', lang: 'js', code: cfg4, highlight: [lineOf(cfg4, '"strict"'), lineOf(cfg4, '"noEmit"')] },
  session: session(S('04-tsc')),
  side: [
    { type: 'item', id: 'cfg', icon: 'settings', title: 'tsconfig.json', sub: 'strict, noEmit, types: node' },
    { type: 'item', id: 'checker', icon: 'search', tone: 'serve', title: 'tsc --noEmit', sub: 'checks, writes nothing' },
    { type: 'item', id: 'files', icon: 'file', title: 'main.ts', sub: 'and every file it imports' },
    { type: 'group', id: 'verdict', bare: true, dir: 'row', children: [
      { type: 'item', id: 'errs', icon: 'bell', tone: 'consume', title: 'errors', sub: 'exit 1' },
      { type: 'item', id: 'silence', icon: 'check', tone: 'store', title: 'silence', sub: 'exit 0: clean' },
    ] },
  ],
  edges: [{ from: 'cfg', to: 'checker' }, { from: 'checker', to: 'files' }, { from: 'files', to: 'errs' }, { from: 'files', to: 'silence' }],
})

// ── 5 · a type error Node still runs ─────────────────────────────────────────────────────────
const main5 = file(S('05-error'), 'main.ts'), run5 = session(S('05-error'))
const error: SceneModel = ide({
  model: 'Checked and run are two paths',
  variant: 'code',
  explorer: tree(S('05-error'), { active: 'main.ts', modified: ['main.ts'] }),
  editor: { filename: 'main.ts', code: main5, show: [[1, lineOf(main5, 'const h')]], highlight: [lineOf(main5, 'const box'), lineOf(main5, 'const w')] },
  session: session(S('05-error')),
  side: [
    { type: 'item', id: 'src5', icon: 'file', title: 'main.ts', sub: "width: '80', a string" },
    { type: 'group', id: 'paths', bare: true, dir: 'row', children: [
      { type: 'group', id: 'checked', title: 'checked', tone: 'serve', children: [
        { type: 'item', id: 'tsc5', icon: 'search', title: 'tsc', sub: `${grab(run5, /error (TS\d+)/)}: not a number` },
      ] },
      { type: 'group', id: 'run', title: 'run', tone: 'infra', children: [
        { type: 'item', id: 'node5', icon: 'cpu', title: 'node', sub: `'80' + 24 is '${grab(run5, /: (\d+) ×/)}'` },
      ] },
    ] },
    { type: 'table', id: 'who', title: 'who catches what', columns: ['', 'tsc', 'node'], rows: [
      ['a wrong type', 'refuses', 'runs it'], ['a syntax error', 'refuses', 'refuses'],
    ] },
  ],
  edges: [{ from: 'src5', to: 'tsc5' }, { from: 'src5', to: 'node5' }],
})

// ── 6 · syntax Node refuses ──────────────────────────────────────────────────────────────────
const main6 = file(S('06-enum'), 'main.ts')
const enumScene: SceneModel = ide({
  model: 'Erasable syntax vs syntax that needs emit',
  variant: 'run',
  explorer: tree(S('06-enum'), { active: 'main.ts', modified: ['main.ts'] }),
  editor: { filename: 'main.ts', code: main6, show: [[lineOf(main6, 'enum Tone'), lineOf(main6, 'const box')]], highlight: [lineOf(main6, 'enum Tone')] },
  session: session(S('06-enum')),
  edges: [{ from: 'strip6', to: 'erasable' }, { from: 'strip6', to: 'emit' }],
  side: [
    { type: 'item', id: 'strip6', icon: 'cpu', tone: 'infra', title: 'Node: strip-only mode', sub: 'it deletes types, and writes nothing new' },
    { type: 'group', id: 'kinds', bare: true, dir: 'row', children: [
      { type: 'group', id: 'erasable', title: 'deletes it', tone: 'store', children: [
        { type: 'item', id: 'alias', title: 'type Box = …', sub: 'a type alias' },
        { type: 'item', id: 'annot', title: ': number', sub: 'an annotation' },
        { type: 'item', id: 'cast', title: 'as Box', sub: 'a cast' },
      ] },
      { type: 'group', id: 'emit', title: 'refuses it', tone: 'consume', children: [
        { type: 'item', id: 'enum6', title: 'enum Tone', sub: 'a real object at run time' },
        { type: 'item', id: 'ns', title: 'namespace', sub: 'a real object too' },
        { type: 'item', id: 'pp', title: 'constructor(private x)', sub: 'a field assignment' },
      ] },
    ] },
  ],
})

// ── 7 · erasableSyntaxOnly ───────────────────────────────────────────────────────────────────
const cfg7 = file(S('07-flag'), 'tsconfig.json'), run7 = session(S('07-flag'))
const flag: SceneModel = ide({
  model: 'One rule, two enforcers',
  variant: 'code',
  explorer: tree(S('07-flag'), { active: 'tsconfig.json', modified: ['tsconfig.json'] }),
  editor: { filename: 'tsconfig.json', lang: 'js', code: cfg7, highlight: linesOf(cfg7, '"erasableSyntaxOnly"') },
  session: session(S('07-flag')),
  side: [
    { type: 'item', id: 'rule', icon: 'shield', title: 'erasable syntax only', sub: 'types Node can delete, nothing else' },
    { type: 'group', id: 'enforcers', bare: true, dir: 'row', children: [
      { type: 'item', id: 'tsc7', icon: 'search', tone: 'serve', title: 'tsc', sub: `${grab(run7, /error (TS\d+)/)}, at ${grab(run7, /^(main\.ts\(\d+,\d+\))/m)}` },
      { type: 'item', id: 'node7', icon: 'cpu', tone: 'infra', title: 'node', sub: grab(session(S('06-enum')), /\[(ERR_[A-Z]+)_/) + '…' },
    ] },
    { type: 'note', id: 'when', text: 'Now the checker refuses, in the editor, what Node would refuse only when the file runs.' },
  ],
  edges: [{ from: 'rule', to: 'tsc7' }, { from: 'rule', to: 'node7' }],
})

export const START: Record<string, SceneModel> = {
  'start-recap': recap,
  'start-node': node,
  'start-main': main,
  'start-emit': emit,
  'start-tsc': tsc,
  'start-error': error,
  'start-enum': enumScene,
  'start-flag': flag,
}
