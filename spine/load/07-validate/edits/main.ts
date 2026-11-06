import { mkdir, writeFile } from 'node:fs/promises'
import { layout } from './src/layout.ts'
import { loadScene, validate } from './src/load.ts'
import { SvgRenderer } from './src/render/svg.ts'
import type { Scene } from './src/model.ts'

await mkdir('out', { recursive: true })
for (const name of ['self', 'checkout']) {
  const path = `scenes/${name}.json`
  const scene = await loadScene(path)
  const errors = validate(scene)
  if (errors.length) {
    console.log(`${path}: ${errors.length} problems`)
    for (const e of errors) console.log(`  ${e}`)
    continue
  }
  const svg = new SvgRenderer().draw(scene as Scene, layout(scene as Scene))
  await writeFile(`out/${name}.svg`, svg)
  console.log(`wrote out/${name}.svg: ${svg.length} chars`)
}
