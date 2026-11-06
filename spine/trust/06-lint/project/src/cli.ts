#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { layout } from './layout.ts'
import { loadScene } from './load.ts'
import { SvgRenderer } from './render/svg.ts'
import { watchScenes } from './watch.ts'

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
  writeFile(out, text)
  console.log(`wrote ${out}`)
  return 0
}

async function check(path: string): Promise<number> {
  const result = await loadScene(path)
  if (result.ok) {
    console.log(`${path}: ok`)
    return 0
  }
  for (const e of result.errors) console.error(`${path}: ${e}`)
  return 1
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
    process.exitCode = await render(path, values.svg)
    break
  case 'check':
    process.exitCode = await check(path)
    break
  case 'watch': {
    const stop = new AbortController()
    process.once('SIGINT', () => {
      console.log('SIGINT: stopping')
      stop.abort()
    })
    await watchScenes(path, (file) => render(file), stop.signal)
    break
  }
  default: {
    const unknown: never = command
    throw new Error(`unknown command ${String(unknown)}`)
  }
}
