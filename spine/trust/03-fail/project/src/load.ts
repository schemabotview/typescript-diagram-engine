import { readFile } from 'node:fs/promises'
import type { Scene } from './model.ts'
import { fail, ok, type Result } from './errors.ts'

const TONES: readonly unknown[] = [
  'neutral', 'source', 'ingest', 'store', 'serve', 'consume', 'infra',
]

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

const show = (x: unknown) => JSON.stringify(x) ?? 'nothing'

function checkNode(
  x: unknown, at: string, errors: string[], ids: Set<string>,
): void {
  if (!isObject(x)) {
    errors.push(`${at}: expected an object`)
    return
  }
  if (typeof x.id !== 'string') errors.push(`${at}.id: expected a string`)
  else if (ids.has(x.id)) errors.push(`${at}.id: duplicate id ${show(x.id)}`)
  else ids.add(x.id)
  const text = (key: string, optional = false) => {
    if (optional && x[key] === undefined) return
    if (typeof x[key] !== 'string') {
      errors.push(`${at}.${key}: expected a string, got ${show(x[key])}`)
    }
  }
  switch (x.type) {
    case 'item':
      text('title')
      text('sub', true)
      if (x.tone !== undefined && !TONES.includes(x.tone)) {
        errors.push(`${at}.tone: not a tone, got ${show(x.tone)}`)
      }
      break
    case 'note':
      text('text')
      break
    case 'group':
      text('title', true)
      if (x.dir !== 'row' && x.dir !== 'col') {
        errors.push(`${at}.dir: expected row | col, got ${show(x.dir)}`)
      }
      if (!Array.isArray(x.children)) {
        errors.push(`${at}.children: expected an array`)
      } else {
        x.children.forEach((c, i) => checkNode(c, `${at}.children[${i}]`, errors, ids))
      }
      break
    default:
      errors.push(`${at}.type: expected item | group | note, got ${show(x.type)}`)
  }
}

export function validate(x: unknown): string[] {
  if (!isObject(x)) return ['the file: expected an object']
  const errors: string[] = []
  if (typeof x.title !== 'string') errors.push('title: expected a string')
  const ids = new Set<string>()
  if (!Array.isArray(x.nodes)) errors.push('nodes: expected an array')
  else x.nodes.forEach((n, i) => checkNode(n, `nodes[${i}]`, errors, ids))
  if (!Array.isArray(x.edges)) errors.push('edges: expected an array')
  else {
    x.edges.forEach((e, i) => {
      if (!isObject(e)) return errors.push(`edges[${i}]: expected an object`)
      for (const end of ['from', 'to'] as const) {
        if (typeof e[end] !== 'string' || !ids.has(e[end])) {
          errors.push(`edges[${i}].${end}: no node ${show(e[end])}`)
        }
      }
    })
  }
  return errors
}

export function assertScene(x: unknown, path: string): asserts x is Scene {
  const errors = validate(x)
  if (errors.length) throw new TypeError(`${path}:\n  ${errors.join('\n  ')}`)
}

export async function loadScene(
  path: string,
): Promise<Result<Scene, string[]>> {
  let data: unknown
  try {
    data = JSON.parse(await readFile(path, 'utf8'))
  } catch (e: unknown) {
    return fail([e instanceof Error ? e.message : String(e)])
  }
  const errors = validate(data)
  return errors.length ? fail(errors) : ok(data as Scene)
}
