import { readFile } from 'node:fs/promises'
import type { Item, Scene, SceneNode } from './model.ts'

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

export function isItem(x: unknown): x is Item {
  return isObject(x) && x.type === 'item'
    && typeof x.id === 'string' && typeof x.title === 'string'
}

export function isNode(x: unknown): x is SceneNode {
  if (!isObject(x) || typeof x.id !== 'string') return false
  switch (x.type) {
    case 'item': return isItem(x)
    case 'note': return typeof x.text === 'string'
    case 'group':
      return Array.isArray(x.children) && x.children.every(isNode)
    default: return false
  }
}

export function isScene(x: unknown): x is Scene {
  return isObject(x) && typeof x.title === 'string'
    && Array.isArray(x.nodes) && x.nodes.every(isNode)
    && Array.isArray(x.edges)
}

export async function loadScene(path: string): Promise<unknown> {
  const text = await readFile(path, 'utf8')
  return JSON.parse(text)
}
