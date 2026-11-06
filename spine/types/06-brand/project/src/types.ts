import type { SceneNode } from './model.ts'

/** Partial, written by hand: every key of T, made optional. */
export type Optional<T> = { [K in keyof T]?: T[K] }

/** Readonly all the way down: every key, of every object, of every array. */
export type DeepReadonly<T> = T extends readonly (infer E)[]
  ? readonly DeepReadonly<E>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

/** The node kind whose tag is K: the union filtered, member by member. */
export type NodeOf<K> = SceneNode extends infer N
  ? N extends { type: K } ? N : never
  : never

/** The element type of an array. */
export type ElementOf<T> = T extends readonly (infer E)[] ? E : never

/** ReturnType, written by hand: what a function gives back. */
export type ReturnOf<F> = F extends (...args: never[]) => infer R ? R : never

/** A string that has been checked to be a node's id: same at run time, different type. */
export type NodeId = string & { readonly __brand: 'NodeId' }

export function nodeId(id: string, known: ReadonlySet<string>): NodeId {
  if (!known.has(id)) throw new RangeError(`no node has the id "${id}"`)
  return id as NodeId
}
