export type Tone =
  | 'neutral' | 'source' | 'ingest' | 'store'
  | 'serve' | 'consume' | 'infra'

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
