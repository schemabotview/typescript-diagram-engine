import { measure, row } from './src/measure.ts'
import { checkout } from './scenes/checkout.ts'

const sizes = []
for (const node of checkout.nodes) {
  if (node.type === 'item') {
    const size = measure(node)
    console.log(node.id, size)
    sizes.push(size)
  }
}
console.log('row of items:', row(24, ...sizes))
const email = { type: 'item', id: 'email', title: 'Email' } as const
console.log('no padding:', measure(email, 0))
