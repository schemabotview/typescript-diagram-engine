import { layout } from './src/layout.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
console.table([...rects].map(([id, r]) => ({ id, ...r })))
