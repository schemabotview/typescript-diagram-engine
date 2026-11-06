import { watch } from 'node:fs/promises'

export function debounce<A extends unknown[]>(
  f: (...args: A) => void, ms: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => f(...args), ms)
  }
}

function announce(dir: string): Disposable {
  console.log(`watching ${dir}/`)
  return { [Symbol.dispose]: () => console.log(`stopped watching ${dir}/`) }
}

export async function watchScenes(
  dir: string, onSave: (path: string) => Promise<unknown>,
  signal: AbortSignal,
): Promise<void> {
  using _watching = announce(dir)
  const later = debounce((path: string) => void onSave(path), 200)
  try {
    for await (const event of watch(dir, { signal })) {
      if (event.filename?.endsWith('.json')) later(`${dir}/${event.filename}`)
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') return
    throw e
  }
}
