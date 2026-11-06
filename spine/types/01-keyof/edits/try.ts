import type { TONE_INFO } from './src/model.ts'

declare const info: typeof TONE_INFO
declare const tone: keyof typeof TONE_INFO

export const probe1: 'probe' = info.store
export const probe2: 'probe' = tone
