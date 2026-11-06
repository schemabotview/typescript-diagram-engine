import type { Scene } from '../src/model.ts'

export const self: Scene = {
  title: 'miniflow',
  nodes: [
    { type: 'item', id: 'model', title: 'Model', sub: 'a typed Scene' },
    {
      type: 'group', id: 'engine', title: 'Engine', dir: 'col',
      children: [
        { type: 'item', id: 'layout',
          title: 'Layout: measure every box bottom-up, then place it top-down.' },
        { type: 'item', id: 'route', title: 'Route', sub: 'the arrows' },
      ],
    },
    { type: 'item', id: 'draw', title: 'Draw', sub: 'an SVG file' },
  ],
}
