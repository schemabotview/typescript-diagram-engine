import { mkdir, writeFile } from 'node:fs/promises'
import { layout } from './src/layout.ts'
import { loadScene } from './src/load.ts'
import { SvgRenderer } from './src/render/svg.ts'

await mkdir('out', { recursive: true })
for (const name of ['self', 'checkout']) {
  const scene = await loadScene(`scenes/${name}.json`)
  const svg = new SvgRenderer().draw(scene, layout(scene))
  await writeFile(`out/${name}.svg`, svg)
  console.log(`wrote out/${name}.svg: ${svg.length} chars`)
}
