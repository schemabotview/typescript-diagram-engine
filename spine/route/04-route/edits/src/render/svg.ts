import type { Scene, SceneNode } from '../model.ts'
import { LINE_H, PAD, type Rect } from '../layout.ts'
import { SvgDocument } from '../svg-document.ts'
import type { Renderer } from './renderer.ts'
import { palette, type Theme } from '../palette.ts'
import { route } from '../route.ts'

const MARGIN = 16
const BASE = 15

const shift = (r: Rect): Rect =>
  ({ ...r, x: r.x + MARGIN, y: r.y + MARGIN })

export function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export class SvgRenderer implements Renderer {
  readonly name = 'svg'
  readonly theme: Theme

  constructor(theme: Theme = 'dark') {
    this.theme = theme
  }

  draw(scene: Scene, rects: Map<string, Rect>): string {
    const all = [...rects.values()]
    const w = Math.max(...all.map((r) => r.x + r.w)) + 2 * MARGIN
    const h = Math.max(...all.map((r) => r.y + r.h)) + 2 * MARGIN
    const doc = new SvgDocument(w, h)
    const c = palette[this.theme]
    doc.rect({ x: 0, y: 0, w, h }, c.canvas, c.canvas)
    const say = (s: string) => escapeXml(s)

    const visit = (node: SceneNode): void => {
      const r = shift(rects.get(node.id)!)
      const x = r.x + PAD
      const y = r.y + PAD + BASE
      switch (node.type) {
        case 'group':
          doc.rect(r, c.group.fill, c.group.stroke)
          if (node.title) doc.text(x, y, say(node.title), c.ink, true)
          node.children.forEach(visit)
          break
        case 'item':
          const { fill, stroke } = c.tones[node.tone ?? 'neutral']
          doc.rect(r, fill, stroke)
          doc.text(x, y, say(node.title), c.ink)
          if (node.sub) doc.text(x, y + LINE_H, say(node.sub), c.muted)
          break
        case 'note':
          doc.rect(r, c.canvas, c.muted, true)
          doc.text(x, y, say(node.text), c.muted)
          break
      }
    }
    scene.nodes.forEach(visit)

    for (const e of scene.edges) {
      const points = route(rects.get(e.from)!, rects.get(e.to)!)
      doc.path(points.map(([x, y]) => [x + MARGIN, y + MARGIN] as const), c.muted)
    }
    return doc.toString()
  }
}
