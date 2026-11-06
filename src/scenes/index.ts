import type { SceneModel } from '@graphlearning/graphl-flow'
import { START } from './start'

const SCENES: Record<string, SceneModel> = { ...START }

export const getScene = (id: string): SceneModel | undefined => SCENES[id]
export const sceneIds = () => Object.keys(SCENES)
