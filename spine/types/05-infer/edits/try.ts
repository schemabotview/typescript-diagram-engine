import type { layout } from './src/layout.ts'
import type { Scene } from './src/model.ts'
import type { route } from './src/route.ts'
import type { ElementOf, ReturnOf } from './src/types.ts'

declare const node: ElementOf<Scene['nodes']>
declare const rects: ReturnOf<typeof layout>
declare const point: ElementOf<ReturnOf<typeof route>>

export const probe1: 'probe' = node
export const probe2: 'probe' = rects
export const probe3: 'probe' = point
