import { sizeOf } from './src/layout.ts'
import { checkout } from './scenes/checkout.ts'

for (const node of checkout.nodes) {
  const { w, h } = sizeOf(node)
  console.log(`${node.type.padEnd(5)} ${node.id.padEnd(8)} ${w} x ${h}`)
}
