import { SvgDocument } from './src/svg-document.ts'

const doc = new SvgDocument(200, 80)
doc.rect({ x: 1, y: 1, w: 104, h: 44 }).text(13, 28, 'checkout')

console.log(doc.toString())
console.log('elements:', doc.size, '| empty:', SvgDocument.empty().size)
