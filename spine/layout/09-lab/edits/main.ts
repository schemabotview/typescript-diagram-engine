import { layout, setLog } from './src/layout.ts'
import { fit } from './src/fit.ts'
import { self } from './scenes/self.ts'

setLog((line) => console.log(line))
const rects = layout(self)
const all = [...rects.values()]
const w = Math.max(...all.map((r) => r.x + r.w))
const h = Math.max(...all.map((r) => r.y + r.h))
const { scale } = fit({ w, h }, { w: 1280, h: 720 })
const k = scale.toFixed(2)
console.log(`fit     ${w} x ${h} into 1280 x 720 at ${k}x`)
