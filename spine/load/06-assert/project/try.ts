import { layout } from './src/layout.ts'
import { loadScene } from './src/load.ts'
import type { Scene } from './src/model.ts'

const scene = await loadScene('scenes/checkout.json') as Scene
console.log('as Scene, so', scene.nodes.length, 'nodes', layout(scene).size)
