import type { SceneActor, StoryCharacter } from '@/scenes/types'

export interface SceneActorViewModel {
  actor: SceneActor
  character: StoryCharacter
  avatarUrl: string
  completed: boolean
}
