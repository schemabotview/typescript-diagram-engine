import { layout } from './src/layout.ts'
import type { Renderer } from './src/render/renderer.ts'
import { OutlineRenderer } from './src/render/outline.ts'
import { SvgRenderer } from './src/render/svg.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
const renderers: Renderer[] = [new OutlineRenderer(), new SvgRenderer()]

for (const r of renderers) {
  const out = r.draw(checkout, rects)
  const first = out.split('\n')[0].slice(0, 30)
  console.log(`${r.name}: ${out.length} chars | ${first}`)
}
