import type { Course } from '@graphlearning/shell'
import { start } from './start'
import { model } from './model'
import { layout } from './layout'
import { draw } from './draw'
import { route } from './route'
import { load } from './load'
import { command } from './command'
import { trust } from './trust'
import { types } from './types'
import { browser } from './browser'
import { ship } from './ship'

// Courses in film order. Course 1 (`intro`) shows the FINISHED app, so it is authored last and
// inserted first.
export const COURSES: Record<string, Course> = { start, model, layout, draw, route, load, command, trust, types, browser, ship }
