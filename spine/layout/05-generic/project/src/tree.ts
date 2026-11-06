import type { SceneNode } from './model.ts'

export function mapTree<T>(
  node: SceneNode, f: (n: SceneNode) => T,
): T[] {
  const here = f(node)
  if (node.type !== 'group') return [here]
  return [here, ...node.children.flatMap((child) => mapTree(child, f))]
}
