import { layout } from './src/layout.ts'
import { anchor, faces, gaps, ports, route } from './src/route.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
const i = checkout.edges.findIndex(
  (e) => e.from === 'queue' && e.to === 'orders',
)
const e = checkout.edges[i]
const a = rects.get(e.from)!
const b = rects.get(e.to)!
const { ta, tb } = ports(checkout.edges, rects)[i]
const [sa, sb] = faces(a, b)

console.log(`edge     ${e.from} -> ${e.to}`)
console.log(`rects    ${e.from} at ${a.x},${a.y}  ${e.to} at ${b.x},${b.y}`)
const g = gaps(a, b)
console.log(`gaps     x ${g.x}  y ${g.y}`)
console.log(`faces    ${e.from} ${sa} -> ${e.to} ${sb}`)
console.log(`ports    ${ta.toFixed(2)} along ${sa}, ${tb.toFixed(2)} along ${sb}`)
console.log(`anchors  ${anchor(a, sa, ta)} -> ${anchor(b, sb, tb)}`)
console.log(`path     ${route(a, b, ta, tb).map((p) => `(${p})`).join(' ')}`)
