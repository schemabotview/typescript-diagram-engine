import { readFile, writeFile } from 'node:fs/promises'
import type { Scene } from './src/model.ts'
import { checkout } from './scenes/checkout.ts'
import { self } from './scenes/self.ts'

async function save(name: string, scene: Scene): Promise<number> {
  const text = JSON.stringify(scene, null, 2) + '\n'
  await writeFile(`scenes/${name}.json`, text)
  return text.length
}

console.log('checkout.json:', await save('checkout', checkout), 'chars')
console.log('self.json:', await save('self', self), 'chars')

const pending = readFile('scenes/self.json', 'utf8')
console.log(pending)
const text = await pending
console.log('read back:', text.split('\n').length, 'lines')
