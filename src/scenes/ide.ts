// The IDE frame (frame v2, as python-expense-tracker's `src/scenes/ide.ts` and graphl-flow's
// `dev/fixtures/studies/ide-frame.ts` build it):
//
//   [explorer] | editor (EDITOR_ROWS[v])                         | side pane: the section's mental model
//              | ONE bottom panel: the terminal OR the output panel |
//
// Every variant has the same height and every column a fixed width, so every IDE frame lands on
// one fit (check-render asserts it). The bottom panel is the terminal (a real transcript, as a
// `console`) or the output panel (a screenshot of what miniflow drew, as a `figure`), never both.
// No edges between panes: point at code with `highlight` and the narration.
import type { Code, Edge, Figure, Group, SceneModel, SceneNode, TreeEntry } from '@graphlearning/graphl-flow'
import FRAME from '../../scripts/frame.json'

const ROW = 24
const CHROME = 51
export const GAP = 10
export const FULL_W = 1344
export const FRAME_H = Math.round(FULL_W / (16 / 9))
export const SIDE_W = 434
export const WORK_W = 715
export const EXPLORER_W = FULL_W - (WORK_W + GAP + SIDE_W) - GAP
export const BARE_SIDE_W = SIDE_W + GAP + EXPLORER_W
export const COLS = 72

export type Variant = 'code' | 'run'
const EDITOR_ROWS: Record<Variant, number> = { code: 18, run: 9 }
const editorH = (v: Variant) => EDITOR_ROWS[v] * ROW + CHROME
const panelH = (v: Variant) => FRAME_H - GAP - editorH(v)
/** Terminal rows the variant shows (the last row is the shell's breadcrumb unless the explorer has it). */
export const terminalRows = (v: Variant, explorer: boolean) => Math.floor((panelH(v) - CHROME) / ROW) - (explorer ? 0 : 1)

export interface Frame {
  /** The side pane's title: the section's mental model. */
  model: string
  variant: Variant
  /** The explorer's entries (`tree(step, …)`); omit for the frame without one. */
  explorer?: TreeEntry[]
  editor: Partial<Code> & { filename: string; code: string }
  /** The terminal: a real transcript. Exactly one of `session` and `output`. */
  session?: string
  /** The output panel: a picture miniflow drew, screenshotted per theme at the panel's 4K pixels. */
  output?: { src: { dark: string; light: string }; title: string; alt: string; chrome?: Figure['chrome'] }
  side: SceneNode[]
  edges?: Edge[]
}

export const ide = ({ model, variant: v, explorer, editor, session, output, side, edges = [] }: Frame): SceneModel => {
  if ((session === undefined) === (output === undefined)) throw new Error(`ide "${model}": one bottom panel, the terminal OR the output`)
  const code: Code = { type: 'code', id: 'editor', lang: 'ts', wrap: true, tone: 'ingest', fill: true, w: WORK_W, minH: editorH(v), ...editor }
  if (session !== undefined) {
    const rows = session.split('\n').length, room = terminalRows(v, !!explorer)
    if (rows > room) throw new Error(`ide "${model}": the transcript has ${rows} rows, the ${v} terminal shows ${room}`)
  }
  const panel: Code | Figure = output
    ? { type: 'figure', id: 'output', alt: output.alt, src: output.src, title: output.title, chrome: output.chrome, w: WORK_W, h: panelH(v) }
    : { type: 'code', id: 'terminal', console: true, cols: COLS, filename: 'terminal — miniflow', code: session!, fill: true, w: WORK_W, minH: panelH(v) }
  const pane: Group = { type: 'group', id: 'side', title: model, tone: 'ingest', spread: true, w: explorer ? SIDE_W : BARE_SIDE_W, minH: FRAME_H, children: side }
  const tr: SceneNode[] = explorer
    ? [{ type: 'tree', id: 'explorer', title: 'miniflow', entries: explorer, compact: true, fill: true, w: EXPLORER_W, minH: FRAME_H }]
    : []
  return { dir: 'row', padding: 0.01, nodes: [...tr, { type: 'group', id: 'workbench', bare: true, children: [code, panel] }, pane], edges }
}

/** The output panel's body in the 4K frame: what spine.py shoots at (measured by check-render). */
export const FIGURE_PX = FRAME.figure
