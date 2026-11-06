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

  rect(r: Rect, fill = '#e8edff', line = '#3b5bdb'): this {
    this.#elements.push(
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"`
        + ` rx="6" fill="${fill}" stroke="${line}"/>`,
    )
    return this
  }

  text(x: number, y: number, content: string, fill = '#1a1d23'): this {
    const at = `x="${x}" y="${y}" fill="${fill}"`
    this.#elements.push(`<text ${at}>${content}</text>`)
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
