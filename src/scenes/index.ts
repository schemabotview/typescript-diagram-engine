import type { SceneModel } from '@graphlearning/graphl-flow'
import { START } from './start'
import { MODEL } from './model'
import { LAYOUT } from './layout'
import { DRAW } from './draw'
import { ROUTE } from './route'
import { LOAD } from './load'

const SCENES: Record<string, SceneModel> = { ...START, ...MODEL, ...LAYOUT, ...DRAW, ...ROUTE, ...LOAD }

export const getScene = (id: string): SceneModel | undefined => SCENES[id]
export const sceneIds = () => Object.keys(SCENES)
