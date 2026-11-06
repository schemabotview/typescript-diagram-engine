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

export async function watchScenes(
  dir: string, onSave: (path: string) => Promise<unknown>,
): Promise<void> {
  console.log(`watching ${dir}/`)
  const later = debounce((path: string) => void onSave(path), 200)
  for await (const event of watch(dir)) {
    console.log(`${event.eventType}: ${event.filename}`)
    if (event.filename?.endsWith('.json')) later(`${dir}/${event.filename}`)
  }
}
