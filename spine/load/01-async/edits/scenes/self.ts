import type { Scene } from '../src/model.ts'

export const self: Scene = {
  title: 'miniflow',
  nodes: [
    { type: 'item', id: 'model', title: 'Model',
      sub: 'a typed Scene', tone: 'source' },
    {
      type: 'group', id: 'engine', title: 'Engine', dir: 'col',
      children: [
        { type: 'item', id: 'layout', title: 'Layout',
          sub: 'a rect per node', tone: 'ingest' },
        { type: 'item', id: 'route', title: 'Route',
          sub: 'a path per edge', tone: 'ingest' },
      ],
    },
    { type: 'item', id: 'draw', title: 'Draw',
      sub: 'an SVG picture', tone: 'serve' },
  ],
  edges: [
    { from: 'model', to: 'layout' },
    { from: 'layout', to: 'route' },
    { from: 'route', to: 'draw' },
  ],
}
