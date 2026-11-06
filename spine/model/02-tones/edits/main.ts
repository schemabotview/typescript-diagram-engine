export type Tone =
  | 'neutral' | 'source' | 'ingest' | 'store'
  | 'serve' | 'consume' | 'infra'

const id = 'orders'
const title = 'Orders DB'
const tone: Tone = 'store'

let kind = 'item'
kind = 'anything at all'

console.log(`[${tone}] ${id}: ${title}`)
