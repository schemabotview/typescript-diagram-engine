// The scenes' only window onto the spine: project files, transcripts and shots, imported from
// spine/ at build time. Nothing on screen is typed by hand — a scene names a step and a path.
import type { TreeEntry } from '@graphlearning/graphl-flow'

const raw = import.meta.glob<string>(['../spine/*/*/project/**', '../spine/*/*/session.txt', '!**/*.png'], {
  query: '?raw', import: 'default', eager: true,
})
const pngs = import.meta.glob<string>('../spine/*/*/shots/*.png', { query: '?url', import: 'default', eager: true })

const key = (step: string, rel: string) => `../spine/${step}/${rel}`

/** A file of the project as it stood after `step` (`start/02-main`). */
export function file(step: string, path: string): string {
  const text = raw[key(step, `project/${path}`)]
  if (text === undefined) throw new Error(`spine: ${step} has no ${path}`)
  return text
}

/** The step's transcript, row for row as the 72-column terminal drew it. */
export function session(step: string): string {
  const text = raw[key(step, 'session.txt')]
  if (text === undefined) throw new Error(`spine: ${step} was never recorded`)
  return text.replace(/\n$/, '')
}

/** The two screenshots of a picture the step wrote (`out/box.svg`), one per theme. */
export function shot(step: string, path: string): { dark: string; light: string } {
  const base = key(step, `shots/${path.replace(/[/:]/g, '-')}`)
  const dark = pngs[`${base}.dark.png`], light = pngs[`${base}.light.png`]
  if (!dark || !light) throw new Error(`spine: ${step} has no shot of ${path}`)
  return { dark, light }
}

/** The 1-based line of the first line containing `needle` — never a typed line number. */
export function lineOf(text: string, needle: string, from = 1): number {
  const lines = text.replace(/^\n/, '').split('\n')
  const i = lines.findIndex((l, k) => k + 1 >= from && l.includes(needle))
  if (i < 0) throw new Error(`spine: no line contains ${JSON.stringify(needle)}`)
  return i + 1
}

/** Every line from the first containing `a` to the first after it containing `b`. */
export function linesOf(text: string, a: string, b = a): number[] {
  const s = lineOf(text, a), e = lineOf(text, b, s)
  return Array.from({ length: e - s + 1 }, (_, k) => s + k)
}

/** The project's files after `step`, as the explorer draws them: folders first, then files. */
export function tree(step: string, opts: { active?: string; added?: string[]; modified?: string[] } = {}): TreeEntry[] {
  const prefix = key(step, 'project/')
  const paths = Object.keys(raw).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length))
  type Dir = Map<string, Dir | null>
  const root: Dir = new Map()
  for (const p of paths) {
    const parts = p.split('/')
    let d = root
    parts.forEach((part, i) => {
      if (i === parts.length - 1) d.set(part, null)
      else { if (!d.get(part)) d.set(part, new Map()); d = d.get(part) as Dir }
    })
  }
  const pkg = paths.includes('package.json') ? JSON.parse(file(step, 'package.json')) : {}
  const hasDeps = !!(pkg.dependencies || pkg.devDependencies)
  const build = (d: Dir, at: string): TreeEntry[] => {
    const names = [...d.keys()].sort((a, b) => Number(!d.get(a)) - Number(!d.get(b)) || a.localeCompare(b))
    return names.map((name) => {
      const path = at + name, sub = d.get(name)
      if (sub) {
        // A folder holding nothing this step touches is drawn closed, as an editor would leave it:
        // the explorer must never grow past the frame's height.
        const inside = (f?: string) => !!f && f.startsWith(path + '/')
        const open = inside(opts.active) || [...(opts.added ?? []), ...(opts.modified ?? [])].some(inside)
        return open ? { name, children: build(sub, path + '/') } : { name, folder: true }
      }
      const state = path === opts.active ? 'active' : opts.added?.includes(path) ? 'new' : undefined
      const note = opts.added?.includes(path) ? 'U' : opts.modified?.includes(path) ? 'M' : undefined
      return { name, ...(state && { state }), ...(note && { note }) } as TreeEntry
    })
  }
  const entries = build(root, '')
  return hasDeps ? [{ name: 'node_modules', folder: true, state: 'muted' }, ...entries] : entries
}

/** The first capture group of `re` in a transcript or file: a value a scene READS, never types. */
export function grab(text: string, re: RegExp): string {
  const m = text.match(re)
  if (!m?.[1]) throw new Error(`spine: ${re} matches nothing`)
  return m[1]
}
