import { mkdirSync, writeFileSync } from 'node:fs'
import { layout } from './src/layout.ts'
import { SvgRenderer } from './src/render/svg.ts'
import { checkout } from './scenes/checkout.ts'

const svg = new SvgRenderer().draw(checkout, layout(checkout))
mkdirSync('out', { recursive: true })
writeFileSync('out/checkout.svg', svg)
console.log('wrote out/checkout.svg:', svg.length, 'chars')
