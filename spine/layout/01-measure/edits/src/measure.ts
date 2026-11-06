import type { Item } from './model.ts'

export interface Size {
  w: number
  h: number
}

export const CHAR_W = 9.6
export const LINE_H = 20

export function measure(item: Item, pad = 12): Size {
  const lines = item.sub ? [item.title, item.sub] : [item.title]
  const longest = Math.max(...lines.map((line) => line.length))
  return {
    w: Math.ceil(longest * CHAR_W) + 2 * pad,
    h: lines.length * LINE_H + 2 * pad,
  }
}

export function row(gap: number, ...sizes: Size[]): Size {
  let w = 0
  let h = 0
  for (const size of sizes) {
    w += size.w
    h = Math.max(h, size.h)
  }
  return { w: w + gap * (sizes.length - 1), h }
}
