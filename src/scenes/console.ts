// The console frame: a real transcript too long for any IDE variant's terminal (a test failure
// with its diff), at full height, beside the side pane with the section's mental model. Its scale
// is its own (a concept frame), so check-render's one-IDE-fit rule does not apply to it.
import type { Edge, SceneModel, SceneNode } from '@graphlearning/graphl-flow'

export const consoleFrame = ({ model, session, highlight = [], side, edges = [] }: {
  model: string; session: string; highlight?: number[]; side: SceneNode[]; edges?: Edge[]
}): SceneModel => ({
  dir: 'row',
  padding: 0.01,
  nodes: [
    { type: 'code', id: 'terminal', console: true, cols: 72, filename: 'terminal — miniflow', code: session, highlight, fill: true },
    { type: 'group', id: 'side', title: model, tone: 'ingest', spread: true, w: 720, children: side },
  ],
  edges,
})
