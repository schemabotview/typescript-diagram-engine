import type { Rect } from './layout.ts'

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

  toString(): string {
    const { width: w, height: h } = this
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"`
        + ' font-family="monospace" font-size="16">',
      ...this.#elements.map((e) => `  ${e}`),
      '</svg>',
      '',
    ].join('\n')
  }
}
