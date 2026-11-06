import { SvgDocument } from './src/svg-document.ts'

const doc = new SvgDocument(300, 80)
doc.rects([
  { x: 1, y: 1, w: 104, h: 44 },
  { x: 129, y: 1, w: 104, h: 44 },
])
console.log(doc.toString())
