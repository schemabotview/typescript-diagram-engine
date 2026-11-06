import { walk } from './src/tree.ts'
import { checkout } from './scenes/checkout.ts'

const MAX_TITLE = 8

let visited = 0
for (const node of walk(checkout.nodes)) {
  visited++
  console.log('visit', node.id)
  if (node.type === 'item' && node.title.length > MAX_TITLE) {
    console.log(`too wide: ${node.title} (${node.title.length} chars)`)
    break
  }
}
console.log(visited, 'visited')
