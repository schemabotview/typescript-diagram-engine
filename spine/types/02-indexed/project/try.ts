import type { Item, Scene, SceneNode } from './src/model.ts'

declare const tone: Item['tone']
declare const kind: SceneNode['type']
declare const first: Scene['nodes'][number]['id']

export const probe1: 'probe' = tone
export const probe2: 'probe' = kind
export const probe3: 'probe' = first
