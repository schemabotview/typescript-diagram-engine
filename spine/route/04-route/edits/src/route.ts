import type { Rect } from './layout.ts'

export type Pt = readonly [x: number, y: number]

export function length(points: readonly Pt[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    total += Math.abs(x1 - x0) + Math.abs(y1 - y0)
  }
  return total
}

export const polyline = (points: readonly Pt[]): string =>
  points.map(([x, y]) => `${x},${y}`).join(' ')

export type Placed = Rect & { readonly id: string }

export const placed = (rects: Map<string, Rect>): Placed[] =>
  [...rects].map(([id, r]) => ({ id, ...r }))

export const centre = (p: Placed): Pt => [p.x + p.w / 2, p.y + p.h / 2]

export type Side = 'left' | 'right' | 'top' | 'bottom'

/** The space between two boxes along x and y (negative: they overlap). */
export function gaps(a: Rect, b: Rect): { x: number; y: number } {
  const x = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w))
  const y = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h))
  return { x, y }
}

/** The faces an edge uses: side by side, across x; stacked, across y. */
export function faces(a: Rect, b: Rect): [Side, Side] {
  const g = gaps(a, b)
  if (g.x > 0) return b.x > a.x ? ['right', 'left'] : ['left', 'right']
  return b.y > a.y ? ['bottom', 'top'] : ['top', 'bottom']
}

/** A point on a face, `t` of the way along it. */
export function anchor(r: Rect, side: Side, t = 0.5): Pt {
  switch (side) {
    case 'left': return [r.x, Math.round(r.y + r.h * t)]
    case 'right': return [r.x + r.w, Math.round(r.y + r.h * t)]
    case 'top': return [Math.round(r.x + r.w * t), r.y]
    case 'bottom': return [Math.round(r.x + r.w * t), r.y + r.h]
  }
}

/** An orthogonal path: out of one face, across the middle of the gap, in. */
export function route(a: Rect, b: Rect, ta = 0.5, tb = 0.5): Pt[] {
  const [sa, sb] = faces(a, b)
  const p = anchor(a, sa, ta)
  const q = anchor(b, sb, tb)
  if (sa === 'left' || sa === 'right') {
    const mx = (p[0] + q[0]) / 2
    return p[1] === q[1] ? [p, q] : [p, [mx, p[1]], [mx, q[1]], q]
  }
  const my = (p[1] + q[1]) / 2
  return p[0] === q[0] ? [p, q] : [p, [p[0], my], [q[0], my], q]
}
