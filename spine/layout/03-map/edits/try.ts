import { layout } from './src/layout.ts'
import { checkout } from './scenes/checkout.ts'

const cart = layout(checkout).get('cart')!
console.log(cart.x)
