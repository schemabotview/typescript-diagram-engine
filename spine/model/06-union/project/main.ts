import { checkout } from './scenes/checkout.ts'

console.log(checkout.title)
for (const node of checkout.nodes) {
  if (node.type === 'group') {
    const n = node.children.length
    console.log(`  ${node.title} (${node.dir}): ${n} children`)
  } else {
    const tone = node.tone ?? 'neutral'
    console.log(`  [${tone}] ${node.id}: ${node.title}`)
  }
}
