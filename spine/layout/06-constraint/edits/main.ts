import { indexById, mapTree } from './src/tree.ts'
import { checkout } from './scenes/checkout.ts'

const all = checkout.nodes.flatMap((n) => mapTree(n, (m) => m))
const byId = indexById(all)
const browser = byId.get('browser')
console.log(byId.size, 'nodes; the browser node:', browser?.type)

const sizes = indexById([{ id: 'api', w: 104 }, { id: 'queue', w: 120 }])
console.log(sizes.get('queue')?.w)
