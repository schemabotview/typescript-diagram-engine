import { edge } from '../src/edge.ts'
import type { Scene } from '../src/model.ts'

export const checkout: Scene = {
  title: 'Checkout',
  nodes: [
    { type: 'note', id: 'why', text: 'one order' },
    {
      type: 'group', id: 'client', title: 'Client', dir: 'col',
      children: [
        { type: 'item', id: 'browser', title: 'Browser',
          sub: 'the shop page', tone: 'consume' },
        { type: 'item', id: 'cart', title: '<Cart>',
          sub: 'the basket', tone: 'consume' },
      ],
    },
    { type: 'item', id: 'api', title: 'API',
      sub: 'POST /checkout', tone: 'serve' },
    {
      type: 'group', id: 'services', title: 'Services', dir: 'col',
      children: [
        { type: 'item', id: 'payments', title: 'Payments',
          sub: 'card provider', tone: 'source' },
        { type: 'item', id: 'inventory', title: 'Inventory',
          sub: 'reserve stock', tone: 'ingest' },
        { type: 'item', id: 'queue', title: 'Queue',
          sub: 'order events', tone: 'infra' },
      ],
    },
    {
      type: 'group', id: 'data', title: 'Data', dir: 'col',
      children: [
        { type: 'item', id: 'orders', title: 'Orders DB',
          sub: 'one row per order', tone: 'store' },
        { type: 'item', id: 'email', title: 'Email',
          sub: 'receipts', tone: 'consume' },
      ],
    },
  ],
  edges: [
    edge('browser', 'cart'),
    edge('cart', 'api'),
    edge('api', 'paymnet'),
    edge('api', 'inventory'),
    edge('api', 'queue'),
    edge({ from: 'payments', to: 'orders', label: 'paid' }),
    edge('inventory', 'orders'),
    edge('queue', 'orders'),
    edge('queue', 'email'),
  ],
}
