import type { Scene } from '../model.ts'
import type { Rect } from '../layout.ts'
import { SvgDocument } from '../svg-document.ts'
import type { Renderer } from './renderer.ts'

export class SvgRenderer implements Renderer {
  readonly name = 'svg'

  draw(scene: Scene, rects: Map<string, Rect>): string {
    const all = [...rects.values()]
    const w = Math.max(...all.map((r) => r.x + r.w))
    const h = Math.max(...all.map((r) => r.y + r.h))
    return new SvgDocument(w, h).rects(all).toString()
  }
}
