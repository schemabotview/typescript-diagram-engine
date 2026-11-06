import type { Edge, Scene, SceneNode } from './model.ts'

export interface Size {
  readonly w: number
  readonly h: number
}

export interface Rect extends Size {
  readonly x: number
  readonly y: number
}

export const CHAR_W = 9.6
export const LINE_H = 20
export const PAD = 12
export const GAP = 24
export const EDGE_GAP = 32

function textSize(lines: string[]): Size {
  const longest = Math.max(...lines.map((line) => line.length))
  return {
    w: Math.ceil(longest * CHAR_W) + 2 * PAD,
    h: lines.length * LINE_H + 2 * PAD,
  }
}

const idsOf = (node: SceneNode): string[] =>
  node.type === 'group' ? [node.id, ...node.children.flatMap(idsOf)] : [node.id]

/** Siblings an edge runs between are set further apart, to leave it room. */
export function gapBetween(nodes: SceneNode[], edges: readonly Edge[]): number {
  const owner = new Map<string, number>()
  nodes.forEach((n, i) => idsOf(n).forEach((id) => owner.set(id, i)))
  const crosses = edges.some((e) => {
    const a = owner.get(e.from)
    const b = owner.get(e.to)
    return a !== undefined && b !== undefined && a !== b
  })
  return crosses ? EDGE_GAP : GAP
}

export function sizeOf(node: SceneNode, edges: readonly Edge[] = []): Size {
  switch (node.type) {
    case 'item':
      return textSize(node.sub ? [node.title, node.sub] : [node.title])
    case 'note':
      return textSize([node.text])
    case 'group': {
      const gap = gapBetween(node.children, edges)
      const inner = node.children.map((c) => sizeOf(c, edges)).reduce(
        (a, b) => node.dir === 'row'
          ? { w: a.w + gap + b.w, h: Math.max(a.h, b.h) }
          : { w: Math.max(a.w, b.w), h: a.h + gap + b.h },
      )
      const head = node.title ? LINE_H + PAD : 0
      return { w: inner.w + 2 * PAD, h: inner.h + head + 2 * PAD }
    }
  }
}

function place(
  node: SceneNode, x: number, y: number,
  edges: readonly Edge[], rects: Map<string, Rect>,
): void {
  rects.set(node.id, { x, y, ...sizeOf(node, edges) })
  if (node.type !== 'group') return
  const gap = gapBetween(node.children, edges)
  let cx = x + PAD
  let cy = y + PAD + (node.title ? LINE_H + PAD : 0)
  for (const child of node.children) {
    place(child, cx, cy, edges, rects)
    const s = sizeOf(child, edges)
    if (node.dir === 'row') cx += s.w + gap
    else cy += s.h + gap
  }
}

export function layout(scene: Scene): Map<string, Rect> {
  const rects = new Map<string, Rect>()
  const gap = gapBetween(scene.nodes, scene.edges)
  let x = 0
  for (const node of scene.nodes) {
    place(node, x, 0, scene.edges, rects)
    x += sizeOf(node, scene.edges).w + gap
  }
  return rects
}
