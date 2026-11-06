import { watch } from 'node:fs/promises'

export async function watchScenes(
  dir: string, onSave: (path: string) => Promise<unknown>,
): Promise<void> {
  console.log(`watching ${dir}/`)
  for await (const event of watch(dir)) {
    console.log(`${event.eventType}: ${event.filename}`)
    if (event.filename?.endsWith('.json')) await onSave(`${dir}/${event.filename}`)
  }
}
