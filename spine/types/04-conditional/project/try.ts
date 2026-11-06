import type { NodeOf } from './src/types.ts'

declare const group: NodeOf<'group'>
declare const either: NodeOf<'item' | 'note'>
declare const nothing: NodeOf<'edge'>

export const probe1: 'probe' = group
export const probe2: 'probe' = either
export const probe3: 'probe' = nothing
