import { layout } from './src/layout.ts'
import { fit } from './src/fit.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
const w = Math.max(...[...rects.values()].map((r) => r.x + r.w))
const h = Math.max(...[...rects.values()].map((r) => r.y + r.h))
console.log('content', w, 'x', h)
console.log(fit({ w, h }, { w: 1280, h: 720 }))
