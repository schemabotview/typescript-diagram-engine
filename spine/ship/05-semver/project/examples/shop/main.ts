import { writeFile } from 'node:fs/promises'
import { SvgRenderer, defineScene, layout, type Item } from 'miniflow'

const web: Item = { type: 'item', id: 'web', title: 'Web shop', sub: 'React', tone: 'consume' }

const shop = defineScene({
  title: 'Shop',
  nodes: [
    web,
    { type: 'item', id: 'api', title: 'API', sub: 'orders', tone: 'serve' },
    { type: 'item', id: 'db', title: 'Postgres', sub: 'orders table', tone: 'store' },
  ],
  edges: [{ from: 'web', to: 'api' }, { from: 'api', to: 'db' }],
})

await writeFile('shop.svg', new SvgRenderer('dark').draw(shop, layout(shop)))
console.log('shop.svg drawn with miniflow')
