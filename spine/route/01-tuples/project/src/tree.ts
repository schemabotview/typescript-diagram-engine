import type { SceneNode } from './model.ts'

export function mapTree<T>(
  node: SceneNode, f: (n: SceneNode) => T,
): T[] {
  const here = f(node)
  if (node.type !== 'group') return [here]
  return [here, ...node.children.flatMap((child) => mapTree(child, f))]
}

export function indexById<N extends { id: string }>(
  nodes: N[],
): Map<string, N> {
  const index = new Map<string, N>()
  for (const node of nodes) {
    if (index.has(node.id)) throw new Error(`duplicate id ${node.id}`)
    index.set(node.id, node)
  }
  return index
}

export function* walk(nodes: SceneNode[]): Generator<SceneNode> {
  for (const node of nodes) {
    yield node
    if (node.type === 'group') yield* walk(node.children)
  }
}
