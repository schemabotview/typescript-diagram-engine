import type { Item } from '../src/model.ts'

// @ts-expect-error: not a tone
const good: Item = { type: 'item', id: 'x', title: 'X', tone: 'store' }
void good
