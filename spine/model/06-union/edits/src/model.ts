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

export type SceneNode = Item | Group

export interface Scene {
  title: string
  nodes: SceneNode[]
}
