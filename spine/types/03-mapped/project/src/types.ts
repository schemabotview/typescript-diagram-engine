/** Partial, written by hand: every key of T, made optional. */
export type Optional<T> = { [K in keyof T]?: T[K] }

/** Readonly all the way down: every key, of every object, of every array. */
export type DeepReadonly<T> = T extends readonly (infer E)[]
  ? readonly DeepReadonly<E>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
