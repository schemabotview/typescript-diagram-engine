import type { SceneModel } from '@graphlearning/graphl-flow'
import { START } from './start'
import { MODEL } from './model'

const SCENES: Record<string, SceneModel> = { ...START, ...MODEL }

export const getScene = (id: string): SceneModel | undefined => SCENES[id]
export const sceneIds = () => Object.keys(SCENES)
