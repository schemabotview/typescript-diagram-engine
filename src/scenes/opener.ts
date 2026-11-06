// The opener frame (COURSE-PLAN.md, "Course openers"; Decision 9): section 0 of every course from 2.
//
//   the app map: one chip per course, done · THIS COURSE (ringed by the section's focus) · muted
//   learned so far (one row per finished course)  |  the app now (real output, already captured)
//                                                 |  this course (what it adds, the question)
//
// Nothing in it is new: "the app now" re-shows output the spine already recorded.
import type { SceneModel, SceneNode, Table } from '@graphlearning/graphl-flow'

/** The courses of the film after the intro, in order; `can` quotes the plan's "After course" table. */
export const COURSE_MAP = [
  { id: 'start', title: 'The first file', ts: 'Node runs `.ts` by stripping types; `tsc --noEmit` checks; erasable syntax only', can: 'draw one box as an SVG file' },
  { id: 'model', title: 'Describe a scene', ts: 'inference, literal unions, object types, optional fields, discriminated unions, narrowing, never', can: 'describe a whole scene as typed data' },
  { id: 'layout', title: 'Lay out the boxes', ts: 'functions, recursion, Map, generics and constraints, generators, readonly', can: 'lay out nested groups, then fit them to a frame' },
  { id: 'draw', title: 'Draw the scene', ts: 'classes, #private, this, inheritance, interfaces, structural typing, Record + satisfies', can: 'draw a scene as an SVG file' },
  { id: 'route', title: 'Draw the arrows', ts: 'tuples, intersections, pure functions, overloads, custom errors with cause', can: 'draw right-angle arrows between any two nodes' },
  { id: 'load', title: 'Read scene files', ts: 'async / await, the event loop, unknown, type guards, assertion functions, Result', can: 'read scene files and reject bad ones' },
  { id: 'command', title: 'Make it a command', ts: 'modules, parseArgs, exit codes, a compiled bin, async iterators, AbortController, using', can: 'run as miniflow render / watch' },
  { id: 'trust', title: 'Trust it', ts: 'strict flags, Vitest, snapshots, type tests, the linter', can: 'pass its tests and the linter' },
  { id: 'types', title: 'Types that compute', ts: 'keyof, mapped and conditional types, infer, brands, template literal types', can: 'catch an edge to an unknown id at compile time' },
  { id: 'browser', title: 'Run it in a browser', ts: 'Vite, DOM types and null, events, ResizeObserver', can: 'render live in a page' },
  { id: 'ship', title: 'Ship it as a package', ts: '.d.ts files, exports, semver', can: 'install from a tarball' },
] as const

export type CourseId = (typeof COURSE_MAP)[number]['id']

export interface Opener {
  course: CourseId
  /** Rows learned before this course that are not a course of COURSE_MAP (the intro). */
  before?: { course: string; ts: string; can: string }[]
  /** The app as the previous course left it: a figure or console from the spine, or an item. */
  now: SceneNode
  /** What this course adds, in the plan's words. */
  adds: string[]
  question: string
}

export const opener = ({ course, before = [], now, adds, question }: Opener): SceneModel => {
  const at = COURSE_MAP.findIndex((c) => c.id === course)
  const map: SceneNode = {
    type: 'group', id: 'map', title: 'miniflow, course by course', tone: 'neutral',
    children: COURSE_MAP.map((c, i) => ({
      type: 'item', id: c.id, title: `${i + 2} · ${c.id}`, sub: c.title,
      icon: i < at ? 'check' : i === at ? 'code' : undefined,
      tone: i < at ? 'store' : i === at ? 'serve' : 'neutral', muted: i > at,
    })),
  }
  const done = COURSE_MAP.slice(0, at)
  const learned: Table = {
    type: 'table', id: 'learned', title: 'learned so far', columns: ['course', 'TypeScript', 'miniflow can…'],
    rows: [
      ...before.map((b) => ({ id: b.course, cells: [b.course, b.ts, b.can] })),
      ...done.map((c, i) => ({ id: c.id, cells: [`${i + 2} ${c.id}`, c.ts, c.can] })),
    ],
  }
  const here = COURSE_MAP[at]
  return {
    dir: 'row',
    nodes: [
      map,
      { type: 'group', id: 'right', bare: true, spread: true, children: [
        learned,
        { type: 'group', id: 'now', title: 'the app now', tone: 'store', children: [now] },
        { type: 'group', id: 'this', title: `this course · ${at + 2} ${here.title}`, tone: 'serve', children: [
          { type: 'item', id: 'next', icon: 'code', title: question, bullets: adds },
        ] },
      ] },
    ],
  }
}
