import { layout } from './src/layout.ts'
import { centre, placed } from './src/route.ts'
import { checkout } from './scenes/checkout.ts'

for (const p of placed(layout(checkout))) {
  if (p.id === 'api' || p.id === 'orders') {
    console.log(p.id, 'at', p.x, p.y, 'centre', centre(p))
  }
}
