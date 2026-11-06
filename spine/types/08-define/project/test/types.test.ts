import { expectTypeOf, it } from 'vitest'
import { layout, type Rect } from '../src/layout.ts'
import type { Item, Tone } from '../src/model.ts'
import { route, type Pt } from '../src/route.ts'

it('layout returns rects by id', () => {
  expectTypeOf(layout).returns.toEqualTypeOf<Map<string, Rect>>()
})

it('route returns points', () => {
  expectTypeOf(route).returns.toEqualTypeOf<Pt[]>()
})

it('a tone is one of seven words', () => {
  expectTypeOf<'store'>().toExtend<Tone>()
  // @ts-expect-error: not a tone
  const bad: Item = { type: 'item', id: 'x', title: 'X', tone: 'stroe' }
  void bad
})
