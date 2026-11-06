// Course 3, `model` — describe a scene in types. Every section ends by running the app.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { grab, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `model/${n}`

const infer = lesson({
  step: S('01-infer'), path: 'main.ts', model: 'Each value gets the type it was given',
  focus: ["const id", "let padding"],
  side: [
    { type: 'table', id: 'inferred', title: 'what tsc infers', columns: ['name', 'value', 'type'], rows: [
      ['id', "'orders'", "'orders'"], ['title', "'Orders DB'", "'Orders DB'"], ['width', '96', '96'],
      ['padding (let)', '12', 'number'], ['visible', 'true', 'true'],
    ] },
    { type: 'group', id: 'kinds', bare: true, dir: 'row', children: [
      { type: 'item', id: 'konst', icon: 'lock', tone: 'store', title: 'const', sub: 'never changes: keeps the exact value' },
      { type: 'item', id: 'let', icon: 'activity', tone: 'ingest', title: 'let', sub: 'can change: widened to number' },
    ] },
  ],
})

const run2 = session(S('02-tones'))
const tones = lesson({
  step: S('02-tones'), path: 'main.ts', model: 'A type is a set of values',
  focus: ["export type Tone", "const tone: Tone", "let kind"],
  side: [
    { type: 'group', id: 'tone', title: 'Tone: seven values, nothing else', tone: 'store', dir: 'grid', cols: 4, children:
      ['neutral', 'source', 'ingest', 'store', 'serve', 'consume', 'infra'].map((t) => ({ type: 'item' as const, id: `t-${t}`, title: `'${t}'`, chip: true })) },
    { type: 'item', id: 'stroe', icon: 'bell', tone: 'consume', title: "'stroe'", sub: `outside the set: ${grab(run2, /error (TS\d+)/)}` },
    { type: 'group', id: 'string', title: 'string: every text there is', tone: 'neutral', children: [
      { type: 'item', id: 'kind', title: "let kind = 'item'", sub: 'widened: any string may follow' },
    ] },
  ],
})

const object = lesson({
  step: S('03-object'), path: 'src/model.ts', model: 'An interface is a shape',
  focus: ['export interface Item', 'sub?: string', 'tone?: Tone'],
  side: [
    { type: 'table', id: 'shape', title: 'Item', columns: ['field', 'type', ''], rows: [
      { id: 'f-id', cells: ['id', 'string', 'required'] }, { id: 'f-title', cells: ['title', 'string', 'required'] },
      { id: 'f-sub', cells: ['sub', 'string', 'optional'], tone: 'ingest' }, { id: 'f-tone', cells: ['tone', 'Tone', 'optional'], tone: 'ingest' },
    ] },
    { type: 'group', id: 'checks', bare: true, dir: 'row', children: [
      { type: 'item', id: 'fits', icon: 'check', tone: 'store', title: 'orders', sub: 'id, title, tone: it fits' },
      { type: 'item', id: 'titel', icon: 'bell', tone: 'consume', title: 'titel', sub: `${grab(session(S('03-object')), /error (TS\d+)/)}: not in the shape` },
    ] },
  ],
})

const optional = lesson({
  step: S('04-optional'), path: 'main.ts', model: 'string | undefined: two branches',
  focus: ["item.tone ?? 'neutral'", 'item.sub ?', 'item.sub?.length'],
  side: [
    { type: 'item', id: 'sub', icon: 'search', title: 'item.sub', sub: 'string | undefined' },
    { type: 'group', id: 'branches', bare: true, dir: 'row', children: [
      { type: 'item', id: 'has', tone: 'store', title: 'a string', sub: "orders: 'one row per order'" },
      { type: 'item', id: 'none', tone: 'neutral', title: 'undefined', sub: 'api: no sub at all' },
    ] },
    { type: 'table', id: 'ops', title: 'the two operators', columns: ['write', 'when undefined'], rows: [
      ['a?.length', 'stop: undefined'], ["a ?? 'neutral'", "use 'neutral'"],
    ] },
  ],
  edges: [{ from: 'sub', to: 'has' }, { from: 'sub', to: 'none' }],
})

const treeScene = lesson({
  step: S('05-tree'), path: 'src/model.ts', model: 'A group holds an array of items',
  focus: ['export interface Group', 'children: Item[]'],
  side: [
    { type: 'item', id: 'data', icon: 'folder', tone: 'neutral', title: 'Group · data', sub: "dir: 'col'" },
    { type: 'group', id: 'kids', title: 'children: Item[]', tone: 'store', dir: 'row', children: [
      { type: 'item', id: 'orders', title: 'orders', sub: 'Orders DB' },
      { type: 'item', id: 'email', title: 'email', sub: 'Email' },
    ] },
  ],
  edges: [{ from: 'data', to: 'kids' }],
})

const union = lesson({
  step: S('06-union'), path: 'src/model.ts', model: 'The union split by its tag',
  focus: ["type: 'item'", "type: 'group'", 'export type SceneNode'],
  side: [
    { type: 'item', id: 'node', icon: 'boxes', title: 'SceneNode', sub: 'Item | Group' },
    { type: 'group', id: 'split', bare: true, dir: 'row', children: [
      { type: 'group', id: 'isItem', title: "type: 'item'", tone: 'store', children: [
        { type: 'item', id: 'itemF', title: 'Item', sub: 'title, sub, tone' },
      ] },
      { type: 'group', id: 'isGroup', title: "type: 'group'", tone: 'ingest', children: [
        { type: 'item', id: 'groupF', title: 'Group', sub: 'dir, children' },
      ] },
    ] },
  ],
  edges: [{ from: 'node', to: 'isItem', label: 'item' }, { from: 'node', to: 'isGroup', label: 'group' }],
})

const narrow = lesson({
  step: S('07-narrow'), path: 'main.ts', model: 'The type at each branch',
  focus: ['switch (node.type)', "case 'item'"],
  side: [
    { type: 'item', id: 'sw', icon: 'branch', title: 'switch (node.type)', sub: 'node: Item | Group' },
    { type: 'group', id: 'cases', bare: true, dir: 'row', children: [
      { type: 'item', id: 'cItem', tone: 'store', title: "case 'item'", sub: 'node: Item · .sub, .tone' },
      { type: 'item', id: 'cGroup', tone: 'ingest', title: "case 'group'", sub: 'node: Group · .children' },
    ] },
    { type: 'item', id: 'recurse', icon: 'workflow', tone: 'ingest', title: 'print(child, depth + 1)', sub: 'each child, one level deeper' },
  ],
  edges: [{ from: 'sw', to: 'cItem' }, { from: 'sw', to: 'cGroup' }, { from: 'cGroup', to: 'recurse' }],
})

const run8 = session(S('08-never'))
const never = lesson({
  step: S('08-never'), path: 'main.ts', model: 'What is left over shrinks to never',
  focus: ['default: {', 'const unhandled: never'],
  side: [
    { type: 'table', id: 'left', title: 'what node can still be', columns: ['after', 'before', 'with Note'], rows: [
      ["case 'item'", 'Group', 'Group | Note'],
      ["case 'group'", 'never', 'Note'],
    ] },
    { type: 'group', id: 'verdict', bare: true, dir: 'row', children: [
      { type: 'item', id: 'ok', icon: 'check', tone: 'store', title: 'never', sub: 'every kind handled' },
      { type: 'item', id: 'bad', icon: 'bell', tone: 'consume', title: 'Note', sub: `${grab(run8, /error (TS\d+)/)} at line ${grab(run8, /main\.ts\((\d+),/)}` },
    ] },
  ],
})

export const MODEL: Record<string, SceneModel> = {
  'model-infer': infer, 'model-tones': tones, 'model-object': object, 'model-optional': optional,
  'model-tree': treeScene, 'model-union': union, 'model-narrow': narrow, 'model-never': never,
}
