import type { Scene, SceneNode } from './model.ts'

export interface Size {
  readonly w: number
  readonly h: number
}

export const CHAR_W = 9.6
export const LINE_H = 20
export const PAD = 12
export const GAP = 24

function textSize(lines: string[]): Size {
  const longest = Math.max(...lines.map((line) => line.length))
  return {
    w: Math.ceil(longest * CHAR_W) + 2 * PAD,
    h: lines.length * LINE_H + 2 * PAD,
  }
}

const row = (a: Size, b: Size): Size =>
  ({ w: a.w + GAP + b.w, h: Math.max(a.h, b.h) })
const col = (a: Size, b: Size): Size =>
  ({ w: Math.max(a.w, b.w), h: a.h + GAP + b.h })

export function sizeOf(node: SceneNode): Size {
  switch (node.type) {
    case 'item':
      return textSize(node.sub ? [node.title, node.sub] : [node.title])
    case 'note':
      return textSize([node.text])
    case 'group': {
      const join = node.dir === 'row' ? row : col
      const inner = node.children.map(sizeOf).reduce(join)
      const head = node.title ? LINE_H + PAD : 0
      return { w: inner.w + 2 * PAD, h: inner.h + head + 2 * PAD }
    }
  }
}

export interface Rect extends Size {
  readonly x: number
  readonly y: number
}

function place(
  node: SceneNode, x: number, y: number, rects: Map<string, Rect>,
): void {
  rects.set(node.id, { x, y, ...sizeOf(node) })
  if (node.type !== 'group') return
  let cx = x + PAD
  let cy = y + PAD + (node.title ? LINE_H + PAD : 0)
  for (const child of node.children) {
    place(child, cx, cy, rects)
    const s = sizeOf(child)
    if (node.dir === 'row') cx += s.w + GAP
    else cy += s.h + GAP
  }
}

export function layout(scene: Scene): Map<string, Rect> {
  const rects = new Map<string, Rect>()
  let x = 0
  for (const node of scene.nodes) {
    place(node, x, 0, rects)
    x += sizeOf(node).w + GAP
  }
  return rects
}
