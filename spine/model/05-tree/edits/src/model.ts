export type Tone =
  | 'neutral' | 'source' | 'ingest' | 'store'
  | 'serve' | 'consume' | 'infra'

export interface Item {
  id: string
  title: string
  sub?: string
  tone?: Tone
}

export interface Group {
  id: string
  title: string
  dir: 'row' | 'col'
  children: Item[]
}
