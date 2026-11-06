import type { Course } from '@graphlearning/shell'
import { start } from './start'

// Courses in film order. Course 1 (`intro`) shows the FINISHED app, so it is authored last and
// inserted first; until then the film opens on Course 2.
export const COURSES: Record<string, Course> = {
  start,
}
