import { layout } from './src/layout.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
for (const r of rects.values()) r.x += 40
