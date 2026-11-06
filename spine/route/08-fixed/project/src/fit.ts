import type { Size } from './layout.ts'

export interface Transform {
  readonly scale: number
  readonly dx: number
  readonly dy: number
}

const MARGIN = 0.04

export function fit(content: Size, frame: Size): Transform {
  const keep = 1 - 2 * MARGIN
  const room = { w: frame.w * keep, h: frame.h * keep }
  const raw = Math.min(room.w / content.w, room.h / content.h)
  const scale = Math.min(4, Math.max(0.05, raw))
  return {
    scale,
    dx: (frame.w - content.w * scale) / 2,
    dy: (frame.h - content.h * scale) / 2,
  }
}
