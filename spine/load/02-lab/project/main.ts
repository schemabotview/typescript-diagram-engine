import { readFile } from 'node:fs/promises'

console.log('sync       the script starts')
setTimeout(() => console.log('timer      setTimeout(0) fires'), 0)
readFile('scenes/self.json', 'utf8')
  .then(() => console.log('I/O        the file has arrived'))
Promise.resolve()
  .then(() => console.log('microtask  a resolved promise'))
queueMicrotask(() => console.log('microtask  queueMicrotask'))
console.log('sync       the script ends')
