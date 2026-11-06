import { length, polyline, type Pt } from './src/route.ts'

const bend: Pt[] = [[620, 32], [642, 32], [642, 116], [664, 116]]
const [start] = bend
const [x, y] = start

console.log('starts at x', x, 'y', y)
console.log('points:', polyline(bend))
console.log('length:', length(bend))
