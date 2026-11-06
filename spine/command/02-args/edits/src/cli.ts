import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { layout } from './layout.ts'
import { loadScene } from './load.ts'
import { SvgRenderer } from './render/svg.ts'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    svg: { type: 'string' },
    theme: { type: 'string', default: 'dark' },
  },
})
const [command, path] = positionals
console.log({ command, path, svg: values.svg, theme: values.theme })

if (command === 'render' && path !== undefined) {
  const result = await loadScene(path)
  if (result.ok) {
    const out = values.svg ?? 'out/scene.svg'
    const svg = new SvgRenderer().draw(result.value, layout(result.value))
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, svg)
    console.log(`wrote ${out}`)
  }
}
