export const TONE_INFO = {
  neutral: 'a plain box',
  source: 'where data comes from',
  ingest: 'moves data in',
  store: 'keeps data',
  serve: 'answers requests',
  consume: 'uses the result',
  infra: 'runs underneath',
} as const

export type Tone = keyof typeof TONE_INFO

export interface Item {
  type: 'item'
  id: string
  title: string
  sub?: string
  tone?: Tone
}

export interface Group {
  type: 'group'
  id: string
  title?: string
  dir: 'row' | 'col'
  children: SceneNode[]
}

export interface Note {
  type: 'note'
  id: string
  text: string
}

export type SceneNode = Item | Group | Note

export interface Edge {
  from: string
  to: string
  label?: string
}

export interface Scene {
  title: string
  nodes: SceneNode[]
  edges: Edge[]
}
