import type { Edge, Scene, SceneNode } from './model.ts'

/** Every id in a tree of nodes, nested ones included: at most five levels deep. */
type IdsOf<N, Depth extends unknown[] = []> = Depth['length'] extends 5
  ? never
  : N extends readonly (infer E)[]
    ? E extends { readonly id: infer I extends string }
      ? I | IdsOf<E extends { readonly children: infer C } ? C : never, [...Depth, E]>
      : never
    : never

/** A scene written in code: every edge must name a node the scene has. */
export function defineScene<const N extends readonly SceneNode[]>(scene: {
  title: string
  nodes: N
  edges: readonly (Edge & { from: IdsOf<N>; to: IdsOf<N> })[]
}): Scene {
  return scene
}
