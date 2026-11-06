import type { Rect } from './layout.ts'
import { polyline, type Pt } from './route.ts'

export class SvgDocument {
  readonly width: number
  readonly height: number
  #elements: string[] = []

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  static empty(): SvgDocument {
    return new SvgDocument(0, 0)
  }

  get size(): number {
    return this.#elements.length
  }

  rect(r: Rect, fill = '#e8edff', line = '#3b5bdb', dashed = false): this {
    const dash = dashed ? ' stroke-dasharray="6 4"' : ''
    this.#elements.push(
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"`
        + ` rx="6" fill="${fill}" stroke="${line}"${dash}/>`,
    )
    return this
  }

  box(r: Rect): this {
    return this.rect(r)
  }

  rects(list: Rect[]): this {
    list.forEach((r) => this.box(r))
    return this
  }

  text(x: number, y: number, content: string, fill = '#1a1d23', bold = false): this {
    const at = `x="${x}" y="${y}" fill="${fill}"`
    const weight = bold ? ' font-weight="bold"' : ''
    this.#elements.push(`<text ${at}${weight}>${content}</text>`)
    return this
  }

  path(points: readonly Pt[], line: string): this {
    this.#elements.push(
      `<polyline points="${polyline(points)}" fill="none" stroke="${line}"`
        + ' stroke-width="1.5" marker-end="url(#head)"/>',
    )
    return this
  }

  toString(): string {
    const { width: w, height: h } = this
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"`
        + ' font-family="monospace" font-size="16">',
      '  <defs><marker id="head" viewBox="0 0 10 10" refX="10" refY="5"'
        + ' markerWidth="10" markerHeight="10" orient="auto-start-reverse">'
        + '<path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>',
      ...this.#elements.map((e) => `  ${e}`),
      '</svg>',
      '',
    ].join('\n')
  }
}
