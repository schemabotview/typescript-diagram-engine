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
