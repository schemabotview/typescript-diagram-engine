// The IDE frame (frame v2, as python-expense-tracker's `src/scenes/ide.ts` and graphl-flow's
// `dev/fixtures/studies/ide-frame.ts` build it):
//
//   [explorer] | editor (the rows the bottom panel leaves)        | side pane: the section's mental model
//              | ONE bottom panel: the terminal OR the output panel |
// The editor shows a hand-picked `show` grown to fill it, or else a window around the highlight.
//
// The editor and the terminal share ROWS rows: the terminal takes exactly its transcript's rows (at
// least MIN_TERMINAL), the editor the rest, so no row is empty while code is folded. The output
// panel keeps the `run` split (a 9-row editor): its picture is shot at that panel's exact 4K size.
// Every frame has the same height and every column a fixed width, so every IDE frame lands on one
// fit (check-render asserts it); only the divider between editor and bottom panel moves. The bottom panel is the terminal (a real transcript, as a
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

/** Rows the editor and the bottom panel share: (FRAME_H − GAP − two panes' chrome) / ROW. */
export const ROWS = Math.floor((FRAME_H - GAP - 2 * CHROME) / ROW)
/** The fewest rows a terminal gets, however short its transcript; the editor keeps at least MIN_EDITOR. */
export const MIN_TERMINAL = 6
export const MIN_EDITOR = 8
/** The output panel's editor: the old `run` split, which FIGURE_PX was measured on. */
export const OUTPUT_EDITOR_ROWS = 9
const editorH = (rows: number) => rows * ROW + CHROME
const panelH = (editorRows: number) => FRAME_H - GAP - editorH(editorRows)
/** The editor's rows beside a bottom panel: the output panel's fixed 9, or what the transcript leaves
 *  (without the explorer, the terminal's last row is the shell's breadcrumb). */
export function editorRowsFor(bottom: { session?: string; explorer: boolean }): number {
  if (bottom.session === undefined) return OUTPUT_EDITOR_ROWS
  return ROWS - Math.max(MIN_TERMINAL, bottom.session.split('\n').length + (bottom.explorer ? 0 : 1))
}

const EDITOR_COLS = 71 // the editor wraps a 72-character line (measured on load-async)
const linesOfText = (text: string) => text.replace(/^\n/, '').replace(/\n$/, '').split('\n')
/** Lines `a`..`b` (1-based) as rows on screen, wrapped at EDITOR_COLS. */
const rowsOf = (lines: string[], a: number, b: number) => lines.slice(a - 1, b).reduce((n, l) => n + Math.max(1, Math.ceil(l.length / EDITOR_COLS)), 0)

/** A window of the file around [first, last] that fits `room` rows, folds included. */
export function windowFor(text: string, first: number, last: number, room: number): [number, number][] | undefined {
  const lines = linesOfText(text)
  if (rowsOf(lines, 1, lines.length) <= room) return undefined
  let a = first, b = last
  const fits = (a: number, b: number) => rowsOf(lines, a, b) + (a > 1 ? 1 : 0) + (b < lines.length ? 1 : 0) <= room
  if (!fits(a, b)) throw new Error(`ide: lines ${first}–${last} do not fit ${room} rows`)
  for (let grew = true; grew;) {
    grew = false
    if (a > 1 && fits(a - 1, b)) { a--; grew = true }
    if (b < lines.length && fits(a, b + 1)) { b++; grew = true }
  }
  return [[a, b]]
}

/** Rows a set of shown ranges takes: each line (wrapped), plus one fold row per skipped run. */
function rowsShown(lines: string[], ranges: [number, number][]): number {
  let rows = 0, next = 1
  for (const [a, b] of ranges) { if (a > next) rows++; rows += rowsOf(lines, a, b); next = b + 1 }
  return rows + (next <= lines.length ? 1 : 0)
}

/** Hand-picked ranges grown, one line at a time, until the editor is full. */
export function grow(text: string, ranges: [number, number][], room: number): [number, number][] {
  const lines = linesOfText(text)
  const merge = (rs: [number, number][]) => [...rs].sort((x, y) => x[0] - y[0]).reduce<[number, number][]>((out, [a, b]) => {
    const last = out[out.length - 1]
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b); else out.push([a, b])
    return out
  }, [])
  let r = merge(ranges.map(([a, b]) => [a, b] as [number, number]))
  for (let grew = true; grew;) {
    grew = false
    for (let i = 0; i < r.length && !grew; i++) for (const side of [1, 0] as const) {
      const t = r.map(([a, b]) => [a, b] as [number, number])
      if (side === 1 && t[i][1] < lines.length) t[i][1]++
      else if (side === 0 && t[i][0] > 1) t[i][0]--
      else continue
      const m = merge(t)
      if (rowsShown(lines, m) <= room) { r = m; grew = true; break }
    }
  }
  return r
}

/** The editor's window: a hand-picked `show`, grown to fill the editor, when it fits; else a window
 *  around the highlight. */
function editorWindow(model: string, editor: { code: string; highlight?: number[]; show?: [number, number][] }, room: number): [number, number][] | undefined {
  if (editor.show && rowsShown(linesOfText(editor.code), editor.show) <= room) return grow(editor.code, editor.show, room)
  const hl = editor.highlight ?? []
  try {
    return hl.length ? windowFor(editor.code, Math.min(...hl), Math.max(...hl), room) : windowFor(editor.code, 1, 1, room)
  } catch (e) {
    throw new Error(`ide "${model}": ${(e as Error).message}`)
  }
}

export interface Frame {
  /** The side pane's title: the section's mental model. */
  model: string
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

export const ide = ({ model, explorer, editor, session, output, side, edges = [] }: Frame): SceneModel => {
  if ((session === undefined) === (output === undefined)) throw new Error(`ide "${model}": one bottom panel, the terminal OR the output`)
  const v = editorRowsFor({ session, explorer: !!explorer })
  if (v < MIN_EDITOR) throw new Error(`ide "${model}": the transcript leaves the editor ${v} rows (at least ${MIN_EDITOR})`)
  const shown = editorWindow(model, editor, v)
  const { show: _hand, ...rest } = editor
  const code: Code = { type: 'code', id: 'editor', lang: 'ts', wrap: true, tone: 'ingest', fill: true, w: WORK_W, minH: editorH(v), ...rest, ...(shown && { show: shown }) }
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
