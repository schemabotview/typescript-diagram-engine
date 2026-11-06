import { layout } from './src/layout.ts'
import { checkout } from './scenes/checkout.ts'

const rects = layout(checkout)
console.log(rects.size, 'rects')

const orders = rects.get('orders')
if (orders) console.log('orders at', orders.x, orders.y)
