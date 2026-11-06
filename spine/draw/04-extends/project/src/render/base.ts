import type { Scene } from '../model.ts'
import type { Rect } from '../layout.ts'

export abstract class BaseRenderer {
  abstract readonly name: string

  abstract draw(scene: Scene, rects: Map<string, Rect>): string

  protected label(title: string, sub?: string): string {
    return sub ? `${title} - ${sub}` : title
  }

  describe(scene: Scene): string {
    return `${this.name}: ${scene.title}, ${scene.nodes.length} nodes`
  }
}
