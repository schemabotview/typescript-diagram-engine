export class SceneError extends Error {
  override readonly name = 'SceneError'
}

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const fail = <E>(errors: E): Result<never, E> => ({ ok: false, errors })
