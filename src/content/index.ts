import type { Course } from '@graphlearning/shell'
import { start } from './start'
import { model } from './model'
import { layout } from './layout'
import { draw } from './draw'

// Courses in film order. Course 1 (`intro`) shows the FINISHED app, so it is authored last and
// inserted first.
export const COURSES: Record<string, Course> = { start, model, layout, draw }
