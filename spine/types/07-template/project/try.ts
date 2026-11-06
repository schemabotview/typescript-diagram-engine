import { parsePort, type Port } from './src/types.ts'

console.log(parsePort('api.right'), parsePort('orders.left'))

export const typo: Port = 'api.rigth'
export const noFace: Port = 'api'
