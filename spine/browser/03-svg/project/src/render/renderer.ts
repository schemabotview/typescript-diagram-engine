import type { Scene } from '../model.ts'
import type { Rect } from '../layout.ts'

export interface Renderer {
  readonly name: string
  draw(scene: Scene, rects: Map<string, Rect>): string
}

export function label(title: string, sub?: string): string {
  return sub ? `${title} - ${sub}` : title
}
