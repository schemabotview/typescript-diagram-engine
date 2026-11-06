import type { Rect } from './src/layout.ts'
import { nodeId, type NodeId } from './src/types.ts'

declare const rects: Map<NodeId, Rect>
const known = new Set(['api', 'orders'])

rects.get(nodeId('api', known))
rects.get('api')

const label = 'paid'
rects.get(label)
