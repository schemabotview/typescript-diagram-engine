import { expect, it } from 'vitest'
import { layout } from '../src/layout.ts'
import { loadScene } from '../src/load.ts'
import { SvgRenderer } from '../src/render/svg.ts'

it('draws the checkout exactly as before', async () => {
  const result = await loadScene('scenes/checkout.json')
  if (!result.ok) throw new Error(result.errors.join('; '))
  const svg = new SvgRenderer().draw(result.value, layout(result.value))
  expect(svg).toMatchSnapshot()
})
