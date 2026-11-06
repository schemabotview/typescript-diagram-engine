// A step section in one call: the IDE frame filled from the step's own step.json.
//   explorer: the project after the step; `changes` marked M (existed in `from`) or U (new)
//   bottom panel: the output panel when the step captured a picture and says `panel: output`,
//                 else the terminal with the step's transcript
//   variant: output → run; a transcript longer than the code terminal → run; else code
//   editor: the file, with `focus` lines highlighted (found by text) and a window around them when
//           the file is longer than the editor
import type { Edge, SceneModel, SceneNode } from '@graphlearning/graphl-flow'
import { file, lineOf, session, shot, tree } from '../spine'
import { ide, terminalRows, type Variant } from './ide'

interface StepJson { from?: string; changes?: string[]; capture?: string[]; panel?: 'terminal' | 'output'; delete?: string[] }
const steps = import.meta.glob<StepJson>('../../spine/*/*/step.json', { import: 'default', eager: true })
const projects = import.meta.glob('../../spine/*/*/project/**', { query: '?url', import: 'default', eager: true })

export const meta = (step: string): StepJson => {
  const m = steps[`../../spine/${step}/step.json`]
  if (!m) throw new Error(`spine: no step ${step}`)
  return m
}
const filesOf = (step: string) => {
  const pre = `../../spine/${step}/project/`
  return Object.keys(projects).filter((k) => k.startsWith(pre)).map((k) => k.slice(pre.length))
}

const EDITOR_ROWS: Record<Variant, number> = { code: 18, run: 9 }
const COLS = 71 // the editor wraps a 72-character line (measured on load-async)
const langOf = (path: string) => (/\.(json|js|mjs|cjs)$/.test(path) ? 'js' : /\.ts$/.test(path) ? 'ts' : /\.(sh)$/.test(path) ? 'shell' : 'text') as 'js' | 'ts' | 'shell' | 'text'

/** Lines `a`..`b` of `text` (1-based) as rows on screen, wrapped at COLS. */
const rowsOf = (lines: string[], a: number, b: number) => lines.slice(a - 1, b).reduce((n, l) => n + Math.max(1, Math.ceil(l.length / COLS)), 0)

/** A window of the file around [first, last] that fits `room` rows, folds included. */
export function windowFor(text: string, first: number, last: number, room: number): [number, number][] | undefined {
  const lines = text.replace(/^\n/, '').replace(/\n$/, '').split('\n')
  if (rowsOf(lines, 1, lines.length) <= room) return undefined
  let a = first, b = last
  const fits = (a: number, b: number) => rowsOf(lines, a, b) + (a > 1 ? 1 : 0) + (b < lines.length ? 1 : 0) <= room
  if (!fits(a, b)) throw new Error(`lesson: lines ${first}–${last} do not fit ${room} rows`)
  for (let grew = true; grew;) {
    grew = false
    if (a > 1 && fits(a - 1, b)) { a--; grew = true }
    if (b < lines.length && fits(a, b + 1)) { b++; grew = true }
  }
  return [[a, b]]
}

export interface Lesson {
  step: string
  /** The file in the editor (default: the step's first change). */
  path?: string
  model: string
  /** Lines to highlight: a needle highlights the first line containing it; a number is a line found by the scene itself. */
  focus?: (string | number)[]
  /** Explicit ranges instead of the automatic window. */
  show?: [number, number][]
  variant?: Variant
  side: SceneNode[]
  edges?: Edge[]
}

export function lesson({ step, path, model, focus = [], show, variant, side, edges }: Lesson): SceneModel {
  const m = meta(step)
  const editPath = path ?? m.changes?.[0]
  if (!editPath) throw new Error(`lesson ${step}: no file to show`)
  const code = file(step, editPath)
  const before = m.from ? new Set(filesOf(m.from)) : new Set<string>()
  const changes = m.changes ?? []
  const after = filesOf(step)
  const added = after.filter((f) => !before.has(f))
  const modified = changes.filter((f) => before.has(f))
  const output = m.panel === 'output' && m.capture?.length
  const transcript = output ? undefined : session(step)
  const v: Variant = variant ?? (output || (transcript && transcript.split('\n').length > terminalRows('code', true)) ? 'run' : 'code')
  const highlight = focus.map((n) => (typeof n === 'number' ? n : lineOf(code, n)))
  const shown = show ?? (highlight.length ? windowFor(code, Math.min(...highlight), Math.max(...highlight), EDITOR_ROWS[v]) : windowFor(code, 1, 1, EDITOR_ROWS[v]))
  const pic = output ? m.capture![0] : undefined
  return ide({
    model, variant: v,
    explorer: tree(step, { active: editPath, added, modified }),
    editor: { filename: editPath, lang: langOf(editPath), code, highlight, ...(shown && { show: shown }) },
    ...(pic ? { output: { src: shot(step, pic), title: pic, alt: `what miniflow drew: ${pic}` } } : { session: transcript }),
    side, edges,
  })
}
