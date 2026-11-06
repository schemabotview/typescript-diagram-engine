import type { Item } from './src/model.ts'

const items: Item[] = [
  { id: 'orders', title: 'Orders DB', sub: 'one row per order' },
  { id: 'api', title: 'API', tone: 'serve' },
]

for (const item of items) {
  const tone = item.tone ?? 'neutral'
  const sub = item.sub ? ` - ${item.sub}` : ''
  console.log(`[${tone}] ${item.id}: ${item.title}${sub}`)
  console.log('  sub length:', item.sub?.length)
}
