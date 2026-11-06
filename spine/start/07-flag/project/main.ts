import { mkdirSync, writeFileSync } from 'node:fs'

enum Tone { Source, Store }
const fills = ['#e8edff', '#e6f7ee']

type Box = { title: string; width: number; height: number; tone: Tone }

const box: Box = { title: 'checkout', width: 80, height: 20, tone: Tone.Store }
const pad: number = 12

const w = box.width + pad * 2
const h = box.height + pad * 2

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 2}" height="${h + 2}">
  <rect x="1" y="1" width="${w}" height="${h}" rx="6"
        fill="${fills[box.tone]}" stroke="#3b5bdb" stroke-width="2"/>
  <text x="${1 + pad}" y="${1 + pad + 15}"
        font-family="monospace" font-size="16">${box.title}</text>
</svg>
`

mkdirSync('out', { recursive: true })
writeFileSync('out/box.svg', svg)
console.log(`wrote out/box.svg: ${w} × ${h}`)
