import type { SceneNode } from './src/model.ts'
import { checkout } from './scenes/checkout.ts'

function print(node: SceneNode, depth: number): void {
  const pad = '  '.repeat(depth)
  switch (node.type) {
    case 'item': {
      const sub = node.sub === undefined ? '' : ` - ${node.sub}`
      const tone = node.tone ?? 'neutral'
      console.log(`${pad}[${tone}] ${node.title}${sub}`)
      break
    }
    case 'group':
      console.log(`${pad}${node.title ?? node.id} (${node.dir})`)
      for (const child of node.children) print(child, depth + 1)
      break
    default: {
      const unhandled: never = node
      throw new Error(`unknown node ${JSON.stringify(unhandled)}`)
    }
  }
}

console.log(checkout.title)
for (const node of checkout.nodes) print(node, 1)
