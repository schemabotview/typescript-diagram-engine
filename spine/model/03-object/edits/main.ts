import type { Item } from './src/model.ts'

const orders: Item = {
  id: 'orders',
  title: 'Orders DB',
  tone: 'store',
}

console.log(`[${orders.tone}] ${orders.id}: ${orders.title}`)
