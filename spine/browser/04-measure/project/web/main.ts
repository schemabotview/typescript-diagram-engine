import checkout from '../scenes/checkout.json' with { type: 'json' }
import { layout, type Measurer } from '../src/layout.ts'
import { SvgRenderer } from '../src/render/svg.ts'
import { assertScene } from '../src/validate.ts'

const FONT = 'sans-serif'

function canvasMeasurer(font: string): Measurer {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) throw new Error('this browser cannot measure text')
  ctx.font = `16px ${font}`
  return { width: (text) => Math.ceil(ctx.measureText(text).width) }
}

const host = document.querySelector('#scene')
if (!host) throw new Error('index.html has no #scene')

assertScene(checkout, 'scenes/checkout.json')
const rects = layout(checkout, canvasMeasurer(FONT))
host.innerHTML = new SvgRenderer('dark', FONT).draw(checkout, rects)
