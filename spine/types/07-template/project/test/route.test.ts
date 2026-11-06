import { describe, expect, it } from 'vitest'
import { faces, ports, route } from '../src/route.ts'

const a = { x: 0, y: 0, w: 100, h: 40 }
const b = { x: 200, y: 100, w: 100, h: 40 }

describe('route', () => {
  it('joins boxes side by side across x', () => {
    expect(faces(a, b)).toEqual(['right', 'left'])
  })

  it('bends once, in the middle of the gap', () => {
    expect(route(a, b)).toEqual([[100, 20], [150, 20], [150, 120], [200, 120]])
  })

  it('spreads three edges over one face, in order', () => {
    const rects = new Map([
      ['p', { x: 0, y: 0, w: 100, h: 40 }],
      ['i', { x: 0, y: 60, w: 100, h: 40 }],
      ['q', { x: 0, y: 120, w: 100, h: 40 }],
      ['orders', { x: 200, y: 0, w: 100, h: 160 }],
    ])
    const edges = ['p', 'i', 'q'].map((from) => ({ from, to: 'orders' }))
    expect(ports(edges, rects).map((p) => p.tb)).toEqual([0.25, 0.5, 0.75])
  })
})
