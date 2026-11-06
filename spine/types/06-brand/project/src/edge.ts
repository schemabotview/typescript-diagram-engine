import type { Edge } from './model.ts'

export function edge(from: string, to: string): Edge
export function edge(spec: { from: string; to: string; label?: string }): Edge
export function edge(
  a: string | { from: string; to: string; label?: string }, b?: string,
): Edge {
  if (typeof a === 'string') {
    if (b === undefined) throw new Error(`edge from ${a} has no end`)
    return { from: a, to: b }
  }
  return { ...a }
}
