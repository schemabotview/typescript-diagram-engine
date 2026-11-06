export type Tone =
  | 'neutral' | 'source' | 'ingest' | 'store'
  | 'serve' | 'consume' | 'infra'

export interface Item {
  id: string
  title: string
  sub?: string
  tone?: Tone
}
