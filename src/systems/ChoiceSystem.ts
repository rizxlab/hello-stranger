import type {
  ChoiceFeedback,
  StoryChoice,
  StoryReward
} from '@/scenes/types'

/** ChoiceSystem 返回给编排层的只读选择结果。 */
export interface ChoiceResult {
  choiceId: string
  expression: string
  feedback: ChoiceFeedback
  nextNodeId: string
  rewards: readonly StoryReward[]
}

export class ChoiceSystemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChoiceSystemError'
  }
}

/**
 * 管理当前节点的可选表达和单次选择。
 *
 * 可见性条件由 StorySystem 处理；奖励和节点跳转由调用方交给对应系统。
 */
export class ChoiceSystem {
  private availableChoices: readonly StoryChoice[] = []
  private choicesById = new Map<string, StoryChoice>()
  private selectedChoiceId: string | null = null

  get choices(): readonly StoryChoice[] {
    return this.availableChoices
  }

  get hasSelection(): boolean {
    return this.selectedChoiceId !== null
  }

  get selectedChoice(): StoryChoice | null {
    if (!this.selectedChoiceId) {
      return null
    }

    return this.choicesById.get(this.selectedChoiceId) ?? null
  }

  /** 载入 StorySystem 已完成条件筛选的选项，并清除上一次选择。 */
  loadChoices(choices: readonly StoryChoice[]): readonly StoryChoice[] {
    const choicesById = new Map<string, StoryChoice>()

    for (const choice of choices) {
      if (choicesById.has(choice.id)) {
        throw new ChoiceSystemError(`选项 ID "${choice.id}" 重复。`)
      }
      choicesById.set(choice.id, choice)
    }

    this.availableChoices = [...choices]
    this.choicesById = choicesById
    this.selectedChoiceId = null

    return this.availableChoices
  }

  /** 选择一个表达。每次载入的选项只能选择一次。 */
  selectChoice(choiceId: string): ChoiceResult {
    if (this.hasSelection) {
      throw new ChoiceSystemError('当前节点已经完成选择。')
    }

    const choice = this.choicesById.get(choiceId)
    if (!choice) {
      throw new ChoiceSystemError(`选项 "${choiceId}" 不存在或当前不可用。`)
    }

    this.selectedChoiceId = choiceId

    return {
      choiceId: choice.id,
      expression: choice.text,
      feedback: choice.feedback,
      nextNodeId: choice.nextNodeId,
      rewards: choice.rewards ?? []
    }
  }

  /** 清空选项；进入不需要玩家选择的节点时使用。 */
  clear(): void {
    this.availableChoices = []
    this.choicesById.clear()
    this.selectedChoiceId = null
  }
}
