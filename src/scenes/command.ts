// Course 8, `command` — make it a command.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { grab, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `command/${n}`
const run = (n: string) => session(S(n))

const modules = lesson({
  step: S('01-modules'), path: 'src/cli.ts', model: 'The module graph',
  focus: ["import { layout } from './layout.ts'", "import { loadScene } from './load.ts'", "import { SvgRenderer } from './render/svg.ts'"],
  side: [
    { type: 'item', id: 'cli', icon: 'terminal', tone: 'serve', title: 'src/cli.ts', sub: 'the entry point: main.ts is gone' },
    { type: 'group', id: 'deps', bare: true, dir: 'row', children: [
      { type: 'item', id: 'layout', icon: 'file', tone: 'ingest', title: 'layout.ts', sub: 'layout' },
      { type: 'item', id: 'load', icon: 'file', tone: 'ingest', title: 'load.ts', sub: 'loadScene' },
      { type: 'item', id: 'svg', icon: 'file', tone: 'ingest', title: 'render/svg.ts', sub: 'SvgRenderer' },
    ] },
    { type: 'item', id: 'type', icon: 'bell', tone: 'consume', title: "import { Scene }", sub: `${grab(run('01-modules'), /error (TS\d+)/)}: a type needs import type` },
  ],
  edges: [{ from: 'cli', to: 'layout' }, { from: 'cli', to: 'load' }, { from: 'cli', to: 'svg' }],
})

const args = lesson({
  step: S('02-args'), path: 'src/cli.ts', model: 'argv becomes a typed options object',
  focus: ['const { values, positionals } = parseArgs({', "svg: { type: 'string' },", "theme: { type: 'string', default: 'dark' },"],
  side: [
    { type: 'item', id: 'argv', icon: 'terminal', tone: 'neutral', title: 'process.argv', sub: "render scenes/checkout.json --svg …" },
    { type: 'item', id: 'pa', icon: 'filter', tone: 'ingest', title: 'parseArgs({ options })', sub: 'the options say what each flag is' },
    { type: 'table', id: 'types', title: 'what the checker knows', columns: ['value', 'type'], rows: [
      ['positionals', 'string[]'], ['values.svg', 'string | undefined'], ['values.theme', 'string (it has a default)'],
    ] },
  ],
  edges: [{ from: 'argv', to: 'pa' }, { from: 'pa', to: 'types' }],
})

const subcommands = lesson({
  step: S('03-subcommands'), path: 'src/cli.ts', model: 'The command routed to its handler',
  focus: ["type Command = 'render' | 'check' | 'watch'", 'const isCommand = '],
  side: [
    { type: 'item', id: 'word', icon: 'search', tone: 'neutral', title: 'positionals[0]', sub: 'a string: anything the user typed' },
    { type: 'item', id: 'guard', icon: 'shield', tone: 'ingest', title: 'isCommand(command)', sub: `no: print usage, exit 2 (${grab(run('03-subcommands'), /node src\/cli\.ts (draw) /)})` },
    { type: 'group', id: 'cases', title: 'switch (command): Command', tone: 'store', dir: 'row', children: [
      { type: 'item', id: 'r', title: 'render', sub: 'draws' },
      { type: 'item', id: 'c', title: 'check', sub: 'not yet' },
      { type: 'item', id: 'w', title: 'watch', sub: 'not yet' },
    ] },
  ],
  edges: [{ from: 'word', to: 'guard' }, { from: 'guard', to: 'cases' }],
})

const exit = lesson({
  step: S('04-exit'), path: 'src/cli.ts', model: 'Three channels out of a process',
  focus: ['async function check(path: string): Promise<number> {'],
  side: [
    { type: 'item', id: 'proc', icon: 'cpu', tone: 'neutral', title: 'miniflow check', sub: 'one process, three ways to answer' },
    { type: 'group', id: 'chans', bare: true, dir: 'row', children: [
      { type: 'item', id: 'out', tone: 'store', title: 'stdout', sub: 'results: ok' },
      { type: 'item', id: 'err', tone: 'consume', title: 'stderr', sub: 'problems, with paths' },
      { type: 'item', id: 'code', tone: 'serve', title: 'exit code', sub: `${grab(run('04-exit'), /^(exit 0)$/m)} or ${grab(run('04-exit'), /^(exit 1)$/m)}` },
    ] },
    { type: 'note', id: 'why', text: 'A script or CI job reads the exit code. 2> /dev/null hides stderr, and the 1 is still there.' },
  ],
  edges: [{ from: 'proc', to: 'out' }, { from: 'proc', to: 'err' }, { from: 'proc', to: 'code' }],
})

const bin = lesson({
  step: S('05b-compile'), path: 'tsconfig.json', model: 'Source → dist/ → the bin link',
  focus: ['"rewriteRelativeImportExtensions": true', '"outDir": "dist"'],
  side: [
    { type: 'item', id: 'ts', icon: 'bell', tone: 'consume', title: '"bin": "src/cli.ts"', sub: `Node: stripping types is ${grab(run('05a-bin-ts').replace(/ \n/g, ' '), /Stripping types is (currently unsupported for files under node_modules)/)}` },
    { type: 'item', id: 'tsc', icon: 'cpu', tone: 'ingest', title: 'npm run build: tsc', sub: "src/*.ts → dist/*.js, './x.ts' → './x.js'" },
    { type: 'item', id: 'js', icon: 'package', tone: 'store', title: '"bin": "dist/cli.js"', sub: 'packed, installed in ../shop' },
    { type: 'item', id: 'ok', icon: 'check', tone: 'store', title: 'npx miniflow check', sub: grab(run('05b-compile'), /self\.json: (ok)/) },
  ],
  edges: [{ from: 'ts', to: 'tsc', label: 'so' }, { from: 'tsc', to: 'js' }, { from: 'js', to: 'ok' }],
})

const watchScene = lesson({
  step: S('06-watch'), path: 'src/watch.ts', model: 'An async iterator of events',
  focus: ['for await (const event of watch(dir)) {'],
  side: [
    { type: 'item', id: 'w', icon: 'search', tone: 'ingest', title: "watch('scenes')", sub: 'an AsyncIterable of file events' },
    { type: 'item', id: 'loop', icon: 'activity', tone: 'serve', title: 'for await … of', sub: 'waits for the next event, forever' },
    { type: 'item', id: 'ev', icon: 'file', tone: 'store', title: grab(run('06-watch'), /^(change: self\.json)$/m), sub: grab(run('06-watch'), /^(wrote out\/self\.svg)$/m) },
  ],
  edges: [{ from: 'w', to: 'loop', label: 'yields' }, { from: 'loop', to: 'ev' }],
})

const changes7 = run('07-debounce').split('\n').filter((l) => l.startsWith('change:')).length
const debounce = lesson({
  step: S('07-debounce'), path: 'src/watch.ts', model: 'A closure holding the pending timer',
  focus: ['let timer: ReturnType<typeof setTimeout> | undefined', 'clearTimeout(timer)', 'timer = setTimeout(() => f(...args), ms)'],
  side: [
    { type: 'item', id: 'evs', icon: 'activity', tone: 'neutral', title: `${changes7} change events`, sub: 'three saves, close together: the count varies run to run' },
    { type: 'item', id: 'closure', icon: 'timer', tone: 'ingest', title: 'later(path)', sub: 'each call clears the timer, then sets it again' },
    { type: 'item', id: 'one', icon: 'check', tone: 'store', title: '1 render', sub: '200 ms after the last event' },
    { type: 'note', id: 'type', text: 'ReturnType<typeof setTimeout>: a Timeout object in Node, a number in a browser.' },
  ],
  edges: [{ from: 'evs', to: 'closure' }, { from: 'closure', to: 'one' }],
})

const abort = lesson({
  step: S('08-abort'), path: 'src/watch.ts', model: 'Dispose at scope end, on every exit',
  focus: ['using _watching = announce(dir)', 'for await (const event of watch(dir, { signal })) {'],
  side: [
    { type: 'item', id: 'sig', icon: 'power', tone: 'consume', title: 'SIGINT (Ctrl-C)', sub: grab(run('08-abort'), /^(SIGINT: stopping)$/m) },
    { type: 'item', id: 'ab', icon: 'zap', tone: 'ingest', title: 'stop.abort()', sub: 'the signal ends watch() with an AbortError' },
    { type: 'item', id: 'ret', icon: 'workflow', tone: 'serve', title: 'catch: return', sub: 'the function leaves its scope' },
    { type: 'item', id: 'disp', icon: 'check', tone: 'store', title: '[Symbol.dispose]()', sub: grab(run('08-abort'), /^(stopped watching scenes\/)$/m) },
  ],
  edges: [{ from: 'sig', to: 'ab' }, { from: 'ab', to: 'ret' }, { from: 'ret', to: 'disp', label: 'using' }],
})

export const COMMAND: Record<string, SceneModel> = {
  'command-modules': modules, 'command-args': args, 'command-subcommands': subcommands, 'command-exit': exit,
  'command-bin': bin, 'command-watch': watchScene, 'command-debounce': debounce, 'command-abort': abort,
}
