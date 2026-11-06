import type { Tone } from './src/model.ts'

const fills = {
  neutral: '#23272f', source: '#2a2140', ingest: '#1e2a3f',
  store: '#1b3127', serve: '#33261a', consume: '#3a1f24',
} satisfies Record<Tone, string>
