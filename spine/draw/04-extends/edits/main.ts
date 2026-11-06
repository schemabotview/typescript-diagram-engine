import { layout } from './src/layout.ts'
import { OutlineRenderer } from './src/render/outline.ts'
import { SvgRenderer } from './src/render/svg.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
const outline = new OutlineRenderer()
const svg = new SvgRenderer()

console.log(outline.describe(checkout))
console.log(svg.describe(checkout))
console.log(outline.draw(checkout))
console.log('svg:', svg.draw(checkout, rects).split('\n').length, 'lines')
