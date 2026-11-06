import { layout } from './src/layout.ts'
import type { Renderer } from './src/render/renderer.ts'
import { OutlineRenderer } from './src/render/outline.ts'
import { SvgRenderer } from './src/render/svg.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
class Stats {
  readonly name = 'stats'
  draw(_scene: unknown, rects: Map<string, unknown>): string {
    return `${rects.size} boxes`
  }
}

const counter = {
  name: 'count',
  draw: (scene: { nodes: unknown[] }) => `${scene.nodes.length} top-level`,
}

const renderers: Renderer[] = [
  new OutlineRenderer(), new SvgRenderer(), new Stats(), counter,
]

for (const r of renderers) {
  const out = r.draw(checkout, rects)
  const first = out.split('\n')[0].slice(0, 30)
  console.log(`${r.name}: ${out.length} chars | ${first}`)
}
