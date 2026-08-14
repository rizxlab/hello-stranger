import type {
  SceneActor,
  StoryChapter,
  StoryScene
} from '@/scenes/types'

export interface SceneInteractionCompletion {
  sceneComplete: boolean
  nextSceneId: string | null
  chapterComplete: boolean
}

export class SceneSystemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SceneSystemError'
  }
}

/** 管理视觉场景、可点击角色和场景目标，不处理具体对话内容。 */
export class SceneSystem {
  private scenesById = new Map<string, StoryScene>()
  private currentSceneId: string | null = null
  private activeActorId: string | null = null
  private completedActorKeys = new Set<string>()

  get currentScene(): StoryScene | null {
    return this.currentSceneId
      ? this.scenesById.get(this.currentSceneId) ?? null
      : null
  }

  get canAdvance(): boolean {
    const scene = this.requireCurrentScene()
    return scene.actors
      .filter((actor) => actor.required !== false)
      .every((actor) =>
        this.completedActorKeys.has(this.createActorKey(scene.id, actor.id))
      )
  }

  loadChapter(chapter: StoryChapter): StoryScene {
    this.validateChapter(chapter)
    this.scenesById = new Map(chapter.scenes.map((scene) => [scene.id, scene]))
    this.currentSceneId = chapter.startSceneId
    this.activeActorId = null
    this.completedActorKeys.clear()
    return this.requireCurrentScene()
  }

  activateActor(actorId: string): SceneActor {
    const actor = this.requireCurrentScene().actors.find(
      (candidate) => candidate.id === actorId
    )

    if (!actor) {
      throw new SceneSystemError(`当前场景中不存在角色热点 "${actorId}"。`)
    }

    if (this.hasCompletedActor(actor.id)) {
      throw new SceneSystemError(`角色热点 "${actorId}" 已经完成。`)
    }

    this.activeActorId = actor.id
    return actor
  }

  completeActiveInteraction(): SceneInteractionCompletion {
    if (!this.activeActorId) {
      throw new SceneSystemError('当前没有正在进行的场景互动。')
    }

    const scene = this.requireCurrentScene()
    this.completedActorKeys.add(
      this.createActorKey(scene.id, this.activeActorId)
    )
    this.activeActorId = null

    const sceneComplete = this.canAdvance

    return {
      sceneComplete,
      nextSceneId: sceneComplete ? scene.nextSceneId ?? null : null,
      chapterComplete: sceneComplete && !scene.nextSceneId
    }
  }

  advanceScene(): StoryScene {
    const scene = this.requireCurrentScene()

    if (!this.canAdvance) {
      throw new SceneSystemError(`场景 "${scene.id}" 的目标尚未完成。`)
    }

    if (!scene.nextSceneId) {
      throw new SceneSystemError(`场景 "${scene.id}" 已经是章节终点。`)
    }

    this.currentSceneId = scene.nextSceneId
    this.activeActorId = null
    return this.requireCurrentScene()
  }

  hasCompletedActor(actorId: string, sceneId?: string): boolean {
    const resolvedSceneId = sceneId ?? this.requireCurrentScene().id
    return this.completedActorKeys.has(
      this.createActorKey(resolvedSceneId, actorId)
    )
  }

  /** 放弃尚未完成的对话并回到场景，不将角色标记为已完成。 */
  cancelActiveInteraction(): void {
    this.activeActorId = null
  }

  clear(): void {
    this.scenesById.clear()
    this.currentSceneId = null
    this.activeActorId = null
    this.completedActorKeys.clear()
  }

  private requireCurrentScene(): StoryScene {
    const scene = this.currentScene
    if (!scene) {
      throw new SceneSystemError('尚未加载视觉场景。')
    }
    return scene
  }

  private validateChapter(chapter: StoryChapter): void {
    const errors: string[] = []
    const sceneIds = new Set(chapter.scenes.map((scene) => scene.id))
    const characterIds = new Set(
      chapter.characters.map((character) => character.id)
    )
    const nodeIds = new Set(chapter.nodes.map((node) => node.id))

    if (!sceneIds.has(chapter.startSceneId)) {
      errors.push(`起始场景 "${chapter.startSceneId}" 不存在。`)
    }

    if (sceneIds.size !== chapter.scenes.length) {
      errors.push('场景 ID 存在重复。')
    }

    for (const scene of chapter.scenes) {
      const actorIds = new Set<string>()

      if (scene.nextSceneId && !sceneIds.has(scene.nextSceneId)) {
        errors.push(
          `场景 "${scene.id}" 指向不存在的场景 "${scene.nextSceneId}"。`
        )
      }

      for (const actor of scene.actors) {
        if (actorIds.has(actor.id)) {
          errors.push(`场景 "${scene.id}" 的角色热点 "${actor.id}" 重复。`)
        }
        actorIds.add(actor.id)

        if (!characterIds.has(actor.characterId)) {
          errors.push(
            `角色热点 "${actor.id}" 引用了不存在的角色 "${actor.characterId}"。`
          )
        }

        if (
          actor.interaction.type === 'dialogue' &&
          !nodeIds.has(actor.interaction.targetId)
        ) {
          errors.push(
            `角色热点 "${actor.id}" 引用了不存在的对话节点 "${actor.interaction.targetId}"。`
          )
        }

        for (const [variant, position] of Object.entries(actor.placement)) {
          if (
            position.x < 0 ||
            position.x > 100 ||
            position.y < 0 ||
            position.y > 100
          ) {
            errors.push(
              `角色热点 "${actor.id}" 的 ${variant} 位置必须在 0 到 100 之间。`
            )
          }
        }
      }
    }

    if (errors.length) {
      throw new SceneSystemError(
        `章节 "${chapter.id}" 的场景数据无效：\n- ${errors.join('\n- ')}`
      )
    }
  }

  private createActorKey(sceneId: string, actorId: string): string {
    return `${sceneId}:${actorId}`
  }
}
