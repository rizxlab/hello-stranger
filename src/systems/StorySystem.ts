import type {
  EnglishSkill,
  StoryChapter,
  StoryCharacter,
  StoryChoice,
  StoryCondition,
  StoryNode
} from '@/scenes/types'

/** StorySystem 判断条件时需要的只读玩家信息。 */
export interface StoryPlayerContext {
  english: Readonly<Record<EnglishSkill, number>>
  vocabulary: readonly string[]
  relationships: Readonly<Record<string, number>>
  flags: Readonly<Record<string, boolean>>
}

/** 剧情数据错误或非法推进操作。 */
export class StorySystemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorySystemError'
  }
}

/**
 * 管理单个已加载章节的节点与跳转。
 *
 * 本系统不负责对话逐句播放、选项反馈或发放奖励，这些职责由后续独立系统处理。
 */
export class StorySystem {
  private chapterData: StoryChapter | null = null
  private currentNodeId: string | null = null
  private nodesById = new Map<string, StoryNode>()
  private charactersById = new Map<string, StoryCharacter>()

  get chapter(): StoryChapter | null {
    return this.chapterData
  }

  get currentNode(): StoryNode | null {
    if (!this.currentNodeId) {
      return null
    }

    return this.nodesById.get(this.currentNodeId) ?? null
  }

  /** 加载并校验一个章节，同时定位到章节起始节点。 */
  loadChapter(chapter: StoryChapter): StoryNode {
    this.validateChapter(chapter)

    this.chapterData = chapter
    this.nodesById = new Map(chapter.nodes.map((node) => [node.id, node]))
    this.charactersById = new Map(
      chapter.characters.map((character) => [character.id, character])
    )
    this.currentNodeId = chapter.startNodeId

    return this.requireCurrentNode()
  }

  /** 清除当前章节，便于之后加载其他章节。 */
  unloadChapter(): void {
    this.chapterData = null
    this.currentNodeId = null
    this.nodesById.clear()
    this.charactersById.clear()
  }

  /** 回到当前章节的起始节点。 */
  restartChapter(): StoryNode {
    const chapter = this.requireChapter()
    return this.goToNode(chapter.startNodeId)
  }

  /** 跳转到章节中的指定节点。 */
  goToNode(nodeId: string): StoryNode {
    this.requireChapter()

    const node = this.nodesById.get(nodeId)
    if (!node) {
      throw new StorySystemError(`无法跳转：节点 "${nodeId}" 不存在。`)
    }

    this.currentNodeId = nodeId
    return node
  }

  /** 当前节点没有选项时，按照 nextNodeId 自动推进。 */
  advanceToNextNode(): StoryNode {
    const node = this.requireCurrentNode()

    if (node.choices?.length) {
      throw new StorySystemError(
        `节点 "${node.id}" 需要玩家选择，不能直接推进。`
      )
    }

    if (!node.nextNodeId) {
      throw new StorySystemError(`节点 "${node.id}" 已经是章节终点。`)
    }

    return this.goToNode(node.nextNodeId)
  }

  /** 返回满足全部条件的可见选项。原始剧情数据不会被修改。 */
  getAvailableChoices(context: StoryPlayerContext): StoryChoice[] {
    const choices = this.requireCurrentNode().choices ?? []

    return choices.filter((choice) =>
      (choice.conditions ?? []).every((condition) =>
        this.meetsCondition(condition, context)
      )
    )
  }

  getCharacter(characterId: string): StoryCharacter | null {
    this.requireChapter()
    return this.charactersById.get(characterId) ?? null
  }

  isChapterComplete(): boolean {
    const node = this.requireCurrentNode()
    return !node.nextNodeId && !node.choices?.length
  }

  meetsCondition(
    condition: StoryCondition,
    context: StoryPlayerContext
  ): boolean {
    switch (condition.type) {
      case 'minimumStat':
        return context.english[condition.stat] >= condition.value
      case 'hasVocabulary':
        return context.vocabulary.includes(condition.word)
      case 'minimumRelationship':
        return (
          (context.relationships[condition.characterId] ?? 0) >= condition.value
        )
      case 'flag':
        return (context.flags[condition.flag] ?? false) === condition.value
    }
  }

  private requireChapter(): StoryChapter {
    if (!this.chapterData) {
      throw new StorySystemError('尚未加载剧情章节。')
    }

    return this.chapterData
  }

  private requireCurrentNode(): StoryNode {
    this.requireChapter()

    const node = this.currentNode
    if (!node) {
      throw new StorySystemError('当前剧情节点不存在。')
    }

    return node
  }

  private validateChapter(chapter: StoryChapter): void {
    const errors: string[] = []
    const characterIds = new Set<string>()
    const nodeIds = new Set<string>()

    for (const character of chapter.characters) {
      if (characterIds.has(character.id)) {
        errors.push(`角色 ID "${character.id}" 重复。`)
      }
      characterIds.add(character.id)
    }

    for (const node of chapter.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`节点 ID "${node.id}" 重复。`)
      }
      nodeIds.add(node.id)
    }

    if (!nodeIds.has(chapter.startNodeId)) {
      errors.push(`起始节点 "${chapter.startNodeId}" 不存在。`)
    }

    for (const node of chapter.nodes) {
      this.validateNode(node, nodeIds, characterIds, errors)
    }

    if (errors.length) {
      throw new StorySystemError(
        `章节 "${chapter.id}" 数据无效：\n- ${errors.join('\n- ')}`
      )
    }
  }

  private validateNode(
    node: StoryNode,
    nodeIds: ReadonlySet<string>,
    characterIds: ReadonlySet<string>,
    errors: string[]
  ): void {
    if (node.choices?.length && node.nextNodeId) {
      errors.push(`节点 "${node.id}" 不能同时设置 choices 和 nextNodeId。`)
    }

    if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) {
      errors.push(
        `节点 "${node.id}" 指向不存在的节点 "${node.nextNodeId}"。`
      )
    }

    for (const line of node.dialogue) {
      if (line.speakerId && !characterIds.has(line.speakerId)) {
        errors.push(
          `节点 "${node.id}" 的对话引用了不存在的角色 "${line.speakerId}"。`
        )
      }
    }

    const choiceIds = new Set<string>()
    for (const choice of node.choices ?? []) {
      if (choiceIds.has(choice.id)) {
        errors.push(`节点 "${node.id}" 的选项 ID "${choice.id}" 重复。`)
      }
      choiceIds.add(choice.id)

      if (!nodeIds.has(choice.nextNodeId)) {
        errors.push(
          `节点 "${node.id}" 的选项 "${choice.id}" 指向不存在的节点 "${choice.nextNodeId}"。`
        )
      }

      for (const condition of choice.conditions ?? []) {
        if (
          condition.type === 'minimumRelationship' &&
          !characterIds.has(condition.characterId)
        ) {
          errors.push(
            `选项 "${choice.id}" 的条件引用了不存在的角色 "${condition.characterId}"。`
          )
        }
      }

      for (const reward of choice.rewards ?? []) {
        if (
          reward.type === 'relationship' &&
          !characterIds.has(reward.characterId)
        ) {
          errors.push(
            `选项 "${choice.id}" 的奖励引用了不存在的角色 "${reward.characterId}"。`
          )
        }
      }
    }
  }
}
