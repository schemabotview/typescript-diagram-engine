import type { Scene, SceneNode } from '../model.ts'
import { BaseRenderer } from './base.ts'

export class OutlineRenderer extends BaseRenderer {
  readonly name = 'outline'

  draw(scene: Scene): string {
    const lines = [scene.title]
    const visit = (node: SceneNode, depth: number): void => {
      const pad = '  '.repeat(depth)
      switch (node.type) {
        case 'item': {
          const tone = node.tone ?? 'neutral'
          lines.push(`${pad}[${tone}] ${this.label(node.title, node.sub)}`)
          break
        }
        case 'note':
          lines.push(`${pad}note: ${node.text}`)
          break
        case 'group':
          lines.push(`${pad}${node.title ?? node.id} (${node.dir})`)
          for (const child of node.children) visit(child, depth + 1)
          break
      }
    }
    for (const node of scene.nodes) visit(node, 1)
    return lines.join('\n')
  }
}
