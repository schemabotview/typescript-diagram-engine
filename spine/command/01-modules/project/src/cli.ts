import { mkdir, writeFile } from 'node:fs/promises'
import { layout } from './layout.ts'
import { loadScene } from './load.ts'
import { SvgRenderer } from './render/svg.ts'

await mkdir('out', { recursive: true })
for (const name of ['self', 'checkout']) {
  const result = await loadScene(`scenes/${name}.json`)
  if (!result.ok) {
    console.error(`scenes/${name}.json: ${result.errors.join('; ')}`)
    continue
  }
  const svg = new SvgRenderer().draw(result.value, layout(result.value))
  await writeFile(`out/${name}.svg`, svg)
  console.log(`wrote out/${name}.svg`)
}
