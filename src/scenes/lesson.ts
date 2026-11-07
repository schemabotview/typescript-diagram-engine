// A step section in one call: the IDE frame filled from the step's own step.json.
//   explorer: the project after the step; `changes` marked M (existed in `from`) or U (new)
//   bottom panel: the output panel when the step captured a picture and says `panel: output`,
//                 else the terminal with the step's transcript
//   editor: the file, with `focus` lines highlighted (found by text); ide() sizes the editor to what
//           the bottom panel leaves and windows it around them (or grows a hand-picked `show`)
import type { Edge, SceneModel, SceneNode } from '@graphlearning/graphl-flow'
import { file, lineOf, session, shot, tree } from '../spine'
import { ide } from './ide'

interface StepJson { from?: string; changes?: string[]; capture?: string[]; page?: { name: string }; panel?: 'terminal' | 'output'; delete?: string[] }
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

const langOf = (path: string) => (/\.(json|js|mjs|cjs)$/.test(path) ? 'js' : /\.ts$/.test(path) ? 'ts' : /\.(sh)$/.test(path) ? 'shell' : 'text') as 'js' | 'ts' | 'shell' | 'text'

export interface Lesson {
  step: string
  /** The file in the editor (default: the step's first change). */
  path?: string
  model: string
  /** Lines to highlight: a needle highlights the first line containing it; a number is a line found by the scene itself. */
  focus?: (string | number)[]
  /** Hand-picked ranges, grown to fill the editor (a window around the focus lines when they do not fit). */
  show?: [number, number][]
  side: SceneNode[]
  edges?: Edge[]
}

export function lesson({ step, path, model, focus = [], show, side, edges }: Lesson): SceneModel {
  const m = meta(step)
  const editPath = path ?? m.changes?.[0]
  if (!editPath) throw new Error(`lesson ${step}: no file to show`)
  const code = file(step, editPath)
  const before = m.from ? new Set(filesOf(m.from)) : new Set<string>()
  const changes = m.changes ?? []
  const after = filesOf(step)
  // A lockfile npm wrote is listed, never marked: its U would not fit a nested row of the explorer.
  const added = after.filter((f) => !before.has(f) && !f.endsWith('package-lock.json'))
  const modified = changes.filter((f) => before.has(f))
  const output = m.panel === 'output' && (m.capture?.length || m.page)
  const transcript = output ? undefined : session(step)
  const highlight = focus.map((n) => (typeof n === 'number' ? n : lineOf(code, n)))
  const pic = output ? (m.page?.name ?? m.capture![0]) : undefined
  return ide({
    model,
    explorer: tree(step, { active: editPath, added, modified }),
    editor: { filename: editPath, lang: langOf(editPath), code, highlight, ...(show && { show }) },
    ...(pic ? { output: { src: shot(step, pic), title: pic, alt: `what miniflow drew: ${pic}`, chrome: m.page ? 'browser' as const : 'tab' as const } } : { session: transcript }),
    side, edges,
  })
}
