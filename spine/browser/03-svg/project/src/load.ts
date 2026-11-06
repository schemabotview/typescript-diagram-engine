import { readFile } from 'node:fs/promises'
import type { Scene } from './model.ts'
import { fail, ok, type Result } from './errors.ts'
import { validate } from './validate.ts'

export { assertScene, validate } from './validate.ts'

export async function loadScene(
  path: string,
): Promise<Result<Scene, string[]>> {
  let data: unknown
  try {
    data = JSON.parse(await readFile(path, 'utf8'))
  } catch (e: unknown) {
    return fail([e instanceof Error ? e.message : String(e)])
  }
  const errors = validate(data)
  return errors.length ? fail(errors) : ok(data as Scene)
}
