import type { Group } from './src/model.ts'

const data: Group = {
  id: 'data',
  title: 'Data',
  dir: 'col',
  children: [
    { id: 'orders', title: 'Orders DB', tone: 'store' },
    { id: 'email', title: 'Email', tone: 'consume' },
  ],
}

console.log(`${data.title} (${data.dir})`)
for (const item of data.children) {
  console.log(`  [${item.tone ?? 'neutral'}] ${item.id}: ${item.title}`)
}
