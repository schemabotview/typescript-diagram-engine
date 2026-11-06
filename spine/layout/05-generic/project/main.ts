import { sizeOf } from './src/layout.ts'
import { mapTree } from './src/tree.ts'
import { checkout } from './scenes/checkout.ts'

const ids = checkout.nodes.flatMap((n) => mapTree(n, (m) => m.id))
const widths = checkout.nodes.flatMap(
  (n) => mapTree(n, (m) => sizeOf(m).w),
)

console.log(ids)
console.log(widths)
console.log('widest:', Math.max(...widths))
