import type { Tone } from './model.ts'

export type Theme = 'dark' | 'light'

interface ToneColor {
  readonly fill: string
  readonly stroke: string
}

interface ThemeColors {
  readonly canvas: string
  readonly group: ToneColor
  readonly ink: string
  readonly muted: string
  readonly tones: Record<Tone, ToneColor>
}

export const palette = {
  dark: {
    canvas: '#1a1d23',
    group: { fill: '#20242c', stroke: '#4b5263' },
    ink: '#e6e8ec',
    muted: '#9aa3b2',
    tones: {
      neutral: { fill: '#23272f', stroke: '#6b7280' },
      source: { fill: '#2a2140', stroke: '#a78bfa' },
      ingest: { fill: '#1e2a3f', stroke: '#60a5fa' },
      store: { fill: '#1b3127', stroke: '#34d399' },
      serve: { fill: '#33261a', stroke: '#f59e0b' },
      consume: { fill: '#3a1f24', stroke: '#f87171' },
      infra: { fill: '#1f2e33', stroke: '#22d3ee' },
    },
  },
  light: {
    canvas: '#f7f8fa',
    group: { fill: '#eef0f4', stroke: '#9aa3b2' },
    ink: '#1a1d23',
    muted: '#5b6472',
    tones: {
      neutral: { fill: '#f1f2f5', stroke: '#6b7280' },
      source: { fill: '#f1ecff', stroke: '#7c3aed' },
      ingest: { fill: '#e8f0ff', stroke: '#2563eb' },
      store: { fill: '#e6f7ee', stroke: '#059669' },
      serve: { fill: '#fff4e0', stroke: '#d97706' },
      consume: { fill: '#ffecec', stroke: '#dc2626' },
      infra: { fill: '#e3f6fa', stroke: '#0891b2' },
    },
  },
} satisfies Record<Theme, ThemeColors>
