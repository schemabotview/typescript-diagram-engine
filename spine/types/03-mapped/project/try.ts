import type { Item, Scene } from './src/model.ts'
import type { DeepReadonly, Optional } from './src/types.ts'

export const patch: Optional<Item> = { title: 'Orders' }

declare const frozen: DeepReadonly<Scene>
const first = frozen.nodes[0]
if (first?.type === 'group') first.children = []
