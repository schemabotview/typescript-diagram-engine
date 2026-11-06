import { describe, expect, it } from 'vitest'
import { fit } from '../src/fit.ts'

describe('fit', () => {
  it('keeps a 4% margin and centres the content', () => {
    const t = fit({ w: 100, h: 50 }, { w: 200, h: 200 })
    expect(t.scale).toBeCloseTo(1.84)
    expect(t.dx).toBeCloseTo(8)
    expect(t.dy).toBeCloseTo(54)
  })

  it('never scales past 4', () => {
    expect(fit({ w: 10, h: 10 }, { w: 1000, h: 1000 }).scale).toBe(4)
  })
})
