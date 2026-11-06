import { mkdir, writeFile } from 'node:fs/promises'
import { layout } from './src/layout.ts'
import { assertScene, loadScene } from './src/load.ts'
import { SvgRenderer } from './src/render/svg.ts'

await mkdir('out', { recursive: true })
for (const name of ['self', 'checkout']) {
  const path = `scenes/${name}.json`
  const scene = await loadScene(path)
  assertScene(scene, path)
  const svg = new SvgRenderer().draw(scene, layout(scene))
  await writeFile(`out/${name}.svg`, svg)
  console.log(`wrote out/${name}.svg: ${svg.length} chars`)
}
