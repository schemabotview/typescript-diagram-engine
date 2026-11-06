import type { Scene, SceneNode } from '../model.ts'
import { LINE_H, PAD, type Rect } from '../layout.ts'
import { SvgDocument } from '../svg-document.ts'
import type { Renderer } from './renderer.ts'

const MARGIN = 16
const BASE = 15

const shift = (r: Rect): Rect =>
  ({ ...r, x: r.x + MARGIN, y: r.y + MARGIN })

export class SvgRenderer implements Renderer {
  readonly name = 'svg'

  draw(scene: Scene, rects: Map<string, Rect>): string {
    const all = [...rects.values()]
    const w = Math.max(...all.map((r) => r.x + r.w)) + 2 * MARGIN
    const h = Math.max(...all.map((r) => r.y + r.h)) + 2 * MARGIN
    const doc = new SvgDocument(w, h)
    doc.rect({ x: 0, y: 0, w, h }, '#1a1d23', '#1a1d23')

    const visit = (node: SceneNode): void => {
      const r = shift(rects.get(node.id)!)
      const x = r.x + PAD
      const y = r.y + PAD + BASE
      switch (node.type) {
        case 'group':
          doc.rect(r, '#20242c', '#4b5263')
          if (node.title) doc.text(x, y, node.title, '#e6e8ec', true)
          node.children.forEach(visit)
          break
        case 'item':
          doc.rect(r, '#1e2a3f', '#60a5fa')
          doc.text(x, y, `${node.title}`, '#e6e8ec')
          if (node.sub) doc.text(x, y + LINE_H, `${node.sub}`, '#9aa3b2')
          break
        case 'note':
          doc.rect(r, '#1a1d23', '#9aa3b2', true)
          doc.text(x, y, `${node.text}`, '#9aa3b2')
          break
      }
    }
    scene.nodes.forEach(visit)
    return doc.toString()
  }
}
