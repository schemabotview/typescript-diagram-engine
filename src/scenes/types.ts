// Course 10, `types` — types that compute. Each section derives a type from code the viewer has,
// and shows it with a PROBE: try.ts assigns the computed type to the literal type 'probe', so tsc's
// real error message prints what the type is.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { grab, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `types/${n}`
const run = (n: string) => session(S(n))
/** The type a probe on `line` of try.ts printed (tsc's own words). */
const probed = (n: string, line: number) =>
  grab(run(n).replace(/\n(?![a-z ]*\.ts\(| {2}Type)/g, ''), new RegExp(`try\\.ts\\(${line},\\d+\\): error TS2322: Type '(.+?)' is not assignable to type '"probe"'`))

const keyof = lesson({
  step: S('01-keyof'), path: 'src/model.ts', model: 'Value → its type → its keys',
  focus: ['} as const', 'export type Tone = keyof typeof TONE_INFO'],
  side: [
    { type: 'item', id: 'value', icon: 'box', tone: 'store', title: 'TONE_INFO', sub: 'a value: seven keys, seven descriptions' },
    { type: 'item', id: 'typeof', icon: 'search', tone: 'ingest', title: 'typeof TONE_INFO', sub: `its type: store is "${grab(run('01-keyof'), /Type '"(keeps data)"'/)}"` },
    { type: 'item', id: 'keyof', icon: 'key', tone: 'serve', title: 'keyof typeof TONE_INFO', sub: 'its keys: "consume" | "infra" | … | "store"' },
    { type: 'note', id: 'one', text: 'One source of truth: the validator now lists Object.keys(TONE_INFO), so adding a tone is one line.' },
  ],
  edges: [{ from: 'value', to: 'typeof' }, { from: 'typeof', to: 'keyof' }],
})

const indexed = lesson({
  step: S('02-indexed'), path: 'try.ts', model: 'A type looked up like a property',
  focus: ["declare const tone: Item['tone']", "declare const kind: SceneNode['type']", "declare const first: Scene['nodes'][number]['id']"],
  side: [
    { type: 'item', id: 'p1', icon: 'search', tone: 'ingest', title: "Item['tone']", sub: 'the seven tones | undefined' },
    { type: 'item', id: 'p2', icon: 'search', tone: 'ingest', title: "SceneNode['type']", sub: probed('02-indexed', 8) },
    { type: 'item', id: 'p3', icon: 'search', tone: 'ingest', title: "Scene['nodes'][number]['id']", sub: probed('02-indexed', 9) },
    { type: 'item', id: 'kinds', icon: 'check', tone: 'store', title: "KINDS: SceneNode['type'][]", sub: 'the validator lists the kinds the model has' },
  ],
})

const mapped = lesson({
  step: S('03-mapped'), path: 'src/types.ts', model: 'Every key of T → a new property',
  focus: ['export type Optional<T> = { [K in keyof T]?: T[K] }', '? { readonly [K in keyof T]: DeepReadonly<T[K]> }'],
  side: [
    { type: 'table', id: 'item', title: 'Item', columns: ['K in keyof Item', 'Optional<Item>'], rows: [
      ['type', 'type?'], ['id', 'id?'], ['title', 'title?'], ['sub', 'sub?'], ['tone', 'tone?'],
    ] },
    { type: 'item', id: 'deep', icon: 'lock', tone: 'consume', title: 'first.children = []', sub: `${grab(run('03-mapped'), /error (TS\d+)/)}: DeepReadonly<Scene> reaches every level` },
  ],
})

const conditional = lesson({
  step: S('04-conditional'), path: 'src/types.ts', model: 'The union filtered, member by member',
  focus: ['export type NodeOf<K> = SceneNode extends infer N', '? N extends { type: K } ? N : never'],
  side: [
    { type: 'item', id: 'u', icon: 'boxes', tone: 'neutral', title: 'SceneNode', sub: 'Item | Group | Note' },
    { type: 'group', id: 'each', title: "NodeOf<'group'>: each member asked", tone: 'ingest', dir: 'row', children: [
      { type: 'item', id: 'i', title: 'Item', sub: 'never', muted: true },
      { type: 'item', id: 'g', title: 'Group', sub: 'kept' },
      { type: 'item', id: 'n', title: 'Note', sub: 'never', muted: true },
    ] },
    { type: 'table', id: 'res', title: 'what the probes printed', columns: ['NodeOf<…>', 'is'], rows: [
      ["'group'", probed('04-conditional', 7)], ["'item' | 'note'", 'Item | Note'], ["'edge'", 'never: no error at all'],
    ] },
  ],
  edges: [{ from: 'u', to: 'each' }],
})

const infer = lesson({
  step: S('05-infer'), path: 'src/types.ts', model: 'A pattern match on a type',
  focus: ['export type ElementOf<T> = T extends readonly (infer E)[] ? E : never', 'export type ReturnOf<F> = F extends (...args: never[]) => infer R ? R : never'],
  side: [
    { type: 'item', id: 'pat', icon: 'search', tone: 'ingest', title: '(...args) => infer R', sub: 'match the shape, capture the hole' },
    { type: 'item', id: 'r1', icon: 'boxes', tone: 'store', title: "ElementOf<Scene['nodes']>", sub: probed('05-infer', 10) },
    { type: 'item', id: 'r2', icon: 'table', tone: 'store', title: 'ReturnOf<typeof layout>', sub: probed('05-infer', 11) },
    { type: 'item', id: 'r3', icon: 'activity', tone: 'store', title: 'ElementOf<ReturnOf<typeof route>>', sub: probed('05-infer', 12) },
  ],
})

const brand = lesson({
  step: S('06-brand'), path: 'src/types.ts', model: 'Same at run time, different type',
  focus: ["export type NodeId = string & { readonly __brand: 'NodeId' }", 'return id as NodeId'],
  side: [
    { type: 'item', id: 's', icon: 'file', tone: 'neutral', title: "'api'", sub: 'a string: could be anything' },
    { type: 'item', id: 'check', icon: 'shield', tone: 'ingest', title: "nodeId('api', known)", sub: 'the one place that checks, then brands' },
    { type: 'item', id: 'id', icon: 'fingerprint', tone: 'store', title: 'NodeId', sub: 'a string the checker trusts as an id' },
    { type: 'item', id: 'label', icon: 'bell', tone: 'consume', title: "rects.get(label)", sub: `${grab(run('06-brand'), /error (TS\d+)/)}: a string is not a NodeId` },
  ],
  edges: [{ from: 's', to: 'check' }, { from: 'check', to: 'id' }],
})

const template = lesson({
  step: S('07-template'), path: 'src/types.ts', model: 'The address grammar',
  focus: ['export type Port = `${string}.${Side}`'],
  side: [
    { type: 'group', id: 'gram', title: '`${string}.${Side}`', tone: 'ingest', dir: 'row', children: [
      { type: 'item', id: 'id', title: 'any id', sub: '${string}' },
      { type: 'item', id: 'dot', title: '.', sub: 'a dot' },
      { type: 'item', id: 'side', title: 'a face', sub: 'left | right | top | bottom' },
    ] },
    { type: 'table', id: 'tries', title: 'the addresses', columns: ['', 'Port?'], rows: [
      { cells: ["'api.right'", 'yes'], tone: 'store' }, { cells: ["'api.rigth'", grab(run('07-template'), /try\.ts\(5,\d+\): error (TS\d+)/)], tone: 'consume' },
      { cells: ["'api'", 'no face: refused'], tone: 'consume' },
    ] },
  ],
})

const run8 = run('08-define')
const define = lesson({
  step: S('08-define'), path: 'scenes/checkout.ts', model: "The scene's ids flow into the edge type",
  focus: ["{ from: 'api', to: 'paymnet' },"],
  side: [
    { type: 'item', id: 'nodes', icon: 'boxes', tone: 'store', title: 'nodes: const N', sub: 'every id kept as its literal' },
    { type: 'item', id: 'ids', icon: 'workflow', tone: 'ingest', title: 'IdsOf<N>', sub: '"api" | "browser" | … | "why": twelve ids' },
    { type: 'item', id: 'edge', icon: 'bell', tone: 'consume', title: "to: 'paymnet'", sub: `${grab(run8, /error (TS\d+)/)} at ${grab(run8, /checkout\.ts(\(\d+,\d+\))/)}: a compile error now` },
    { type: 'note', id: 'was', text: 'In Course 6 this typo was a SceneError at run time. The same mistake now cannot be saved.' },
  ],
  edges: [{ from: 'nodes', to: 'ids' }, { from: 'ids', to: 'edge' }],
})

export const TYPES: Record<string, SceneModel> = {
  'types-keyof': keyof, 'types-indexed': indexed, 'types-mapped': mapped, 'types-conditional': conditional,
  'types-infer': infer, 'types-brand': brand, 'types-template': template, 'types-define': define,
}
