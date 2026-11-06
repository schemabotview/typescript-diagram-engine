import checkout from '../scenes/checkout.json' with { type: 'json' }
import { layout, type Measurer } from '../src/layout.ts'
import type { Theme } from '../src/palette.ts'
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
const button = document.querySelector<HTMLButtonElement>('#theme')
if (!host || !button) throw new Error('index.html needs #scene and #theme')

assertScene(checkout, 'scenes/checkout.json')
const scene = checkout
const rects = layout(scene, canvasMeasurer(FONT))
let theme: Theme = 'dark'

function draw(): void {
  host!.innerHTML = new SvgRenderer(theme, FONT).draw(scene, rects)
  document.body.dataset.theme = theme
  button!.textContent = theme === 'dark' ? 'light' : 'dark'
}

button.addEventListener('click', (event: MouseEvent) => {
  theme = theme === 'dark' ? 'light' : 'dark'
  console.log(`theme: ${theme}, clicked at ${event.clientX},${event.clientY}`)
  draw()
})
draw()
