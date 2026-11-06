import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { layout } from './layout.ts'
import { loadScene } from './load.ts'
import { SvgRenderer } from './render/svg.ts'

type Command = 'render' | 'check' | 'watch'

const isCommand = (s: string | undefined): s is Command =>
  s === 'render' || s === 'check' || s === 'watch'

const USAGE = 'usage: miniflow <render | check | watch> <path> [--svg file]'

async function render(path: string, svg?: string): Promise<number> {
  const result = await loadScene(path)
  if (!result.ok) {
    for (const e of result.errors) console.error(`${path}: ${e}`)
    return 1
  }
  const out = svg ?? path.replace(/^scenes/, 'out').replace(/json$/, 'svg')
  const text = new SvgRenderer().draw(result.value, layout(result.value))
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, text)
  console.log(`wrote ${out}`)
  return 0
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { svg: { type: 'string' } },
})
const [command, path] = positionals

if (!isCommand(command) || path === undefined) {
  console.error(USAGE)
  process.exit(2)
}

switch (command) {
  case 'render':
    await render(path, values.svg)
    break
  case 'check':
    console.log('check: not yet')
    break
  case 'watch':
    console.log('watch: not yet')
    break
  default: {
    const unknown: never = command
    throw new Error(`unknown command ${unknown}`)
  }
}
