import checkout from '../scenes/checkout.json' with { type: 'json' }
import { layout } from '../src/layout.ts'
import { SvgRenderer } from '../src/render/svg.ts'
import { assertScene } from '../src/validate.ts'

const host = document.querySelector('#scene')
if (!host) throw new Error('index.html has no #scene')

assertScene(checkout, 'scenes/checkout.json')
host.innerHTML = new SvgRenderer().draw(checkout, layout(checkout))
