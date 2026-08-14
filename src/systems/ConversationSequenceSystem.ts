import type {
  ConversationChoice,
  ConversationChoiceTurn,
  ConversationExperienceDefinition,
  ConversationScenarioDefinition,
  ConversationTurn
} from '@/scenes/conversations/types'
import type { ChoiceFeedback, StoryReward } from '@/scenes/types'

export type ConversationPhase =
  | 'empty'
  | 'intro'
  | 'conversation'
  | 'choice'
  | 'feedback'
  | 'scenario-complete'

export interface ConversationTranscriptEntry {
  turnId: string
  speakerId: string
  text: string
  translation?: string
  isPlayerChoice: boolean
}

export interface ConversationChoiceResult {
  choiceId: string
  expression: string
  feedback: ChoiceFeedback
  rewards: readonly StoryReward[]
  nextTurnId?: string
}

export class ConversationSequenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConversationSequenceError'
  }
}

/** 管理课程中的子情景、连续对话、选择与跳转，不依赖 Vue 或页面组件。 */
export class ConversationSequenceSystem {
  private experienceValue: ConversationExperienceDefinition | null = null
  private scenariosValue: readonly ConversationScenarioDefinition[] = []
  private scenarioIndex = 0
  private turnIndex = 0
  private phaseValue: ConversationPhase = 'empty'
  private transcriptValue: ConversationTranscriptEntry[] = []
  private choiceResultValue: ConversationChoiceResult | null = null

  get experience(): ConversationExperienceDefinition | null {
    return this.experienceValue
  }

  get scenarios(): readonly ConversationScenarioDefinition[] {
    return this.scenariosValue
  }

  get currentScenario(): ConversationScenarioDefinition | null {
    return this.scenariosValue[this.scenarioIndex] ?? null
  }

  get currentScenarioIndex(): number {
    return this.scenarioIndex
  }

  get phase(): ConversationPhase {
    return this.phaseValue
  }

  get transcript(): readonly ConversationTranscriptEntry[] {
    return [...this.transcriptValue]
  }

  get currentTurn(): ConversationTurn | null {
    return this.currentScenario?.turns[this.turnIndex] ?? null
  }

  get currentChoiceTurn(): ConversationChoiceTurn | null {
    const turn = this.currentTurn
    return turn?.type === 'choice' ? turn : null
  }

  get choiceResult(): ConversationChoiceResult | null {
    return this.choiceResultValue
  }

  get hasNextScenario(): boolean {
    return this.scenarioIndex < this.scenariosValue.length - 1
  }

  loadExperience(
    experience: ConversationExperienceDefinition,
    scenarios: readonly ConversationScenarioDefinition[],
    startScenarioId?: string
  ): void {
    if (!scenarios.length) {
      throw new ConversationSequenceError(`会话体验 "${experience.id}" 没有子情景。`)
    }

    for (const scenario of scenarios) {
      this.validateScenario(experience, scenario)
    }

    const startIndex = startScenarioId
      ? scenarios.findIndex((scenario) => scenario.id === startScenarioId)
      : 0

    if (startScenarioId && startIndex < 0) {
      throw new ConversationSequenceError(
        `子情景 "${startScenarioId}" 不属于会话体验 "${experience.id}"。`
      )
    }

    this.experienceValue = experience
    this.scenariosValue = [...scenarios]
    this.scenarioIndex = Math.max(0, startIndex)
    this.resetScenarioState()
  }

  beginScenario(): void {
    if (this.phaseValue !== 'intro') {
      throw new ConversationSequenceError('只有情景介绍页可以开始会话。')
    }
    this.revealCurrentTurn()
  }

  advanceConversation(): void {
    if (this.phaseValue !== 'conversation') {
      throw new ConversationSequenceError('当前没有可继续推进的对话。')
    }
    const turn = this.currentTurn
    if (turn?.type === 'line' && turn.endScenario) {
      this.phaseValue = 'scenario-complete'
      return
    }

    this.turnIndex += 1
    this.revealCurrentTurn()
  }

  selectChoice(choiceId: string): ConversationChoiceResult {
    const turn = this.currentChoiceTurn
    if (this.phaseValue !== 'choice' || !turn) {
      throw new ConversationSequenceError('当前没有等待选择的表达。')
    }

    const choice = turn.choices.find((item) => item.id === choiceId)
    if (!choice) {
      throw new ConversationSequenceError(`选项 "${choiceId}" 不存在。`)
    }

    this.transcriptValue.push({
      turnId: turn.id,
      speakerId: turn.speakerId,
      text: choice.text,
      isPlayerChoice: true
    })
    this.choiceResultValue = this.createChoiceResult(choice)
    this.phaseValue = 'feedback'
    return this.choiceResultValue
  }

  returnToChoice(): void {
    if (this.phaseValue !== 'feedback' || !this.choiceResultValue) {
      throw new ConversationSequenceError('当前没有可以返回的表达选项。')
    }

    const selectedChoiceId = this.choiceResultValue.choiceId
    const lastEntry = this.transcriptValue.at(-1)
    if (
      lastEntry?.isPlayerChoice &&
      lastEntry.turnId === this.currentChoiceTurn?.id
    ) {
      this.transcriptValue.pop()
    } else {
      throw new ConversationSequenceError(
        `无法撤回选项 "${selectedChoiceId}" 对应的玩家表达。`
      )
    }

    this.choiceResultValue = null
    this.phaseValue = 'choice'
  }

  continueAfterFeedback(): ConversationChoiceResult {
    if (this.phaseValue !== 'feedback') {
      throw new ConversationSequenceError('当前没有等待继续的学习反馈。')
    }
    const confirmedResult = this.choiceResultValue
    if (!confirmedResult) {
      throw new ConversationSequenceError('当前反馈没有对应的选择结果。')
    }
    const nextTurnId = confirmedResult.nextTurnId
    this.choiceResultValue = null
    if (nextTurnId) {
      this.turnIndex = this.getTurnIndex(nextTurnId)
    } else {
      this.turnIndex += 1
    }
    this.revealCurrentTurn()
    return confirmedResult
  }

  goToScenario(scenarioId: string): void {
    const index = this.scenariosValue.findIndex(
      (scenario) => scenario.id === scenarioId
    )
    if (index < 0) {
      throw new ConversationSequenceError(`子情景 "${scenarioId}" 不存在。`)
    }
    this.scenarioIndex = index
    this.resetScenarioState()
  }

  goToNextScenario(): void {
    if (!this.hasNextScenario) {
      throw new ConversationSequenceError('当前已经是最后一个子情景。')
    }
    this.scenarioIndex += 1
    this.resetScenarioState()
  }

  restartScenario(): void {
    if (!this.currentScenario) {
      throw new ConversationSequenceError('当前没有可重新体验的子情景。')
    }
    this.resetScenarioState()
  }

  clear(): void {
    this.experienceValue = null
    this.scenariosValue = []
    this.scenarioIndex = 0
    this.turnIndex = 0
    this.phaseValue = 'empty'
    this.transcriptValue = []
    this.choiceResultValue = null
  }

  private resetScenarioState(): void {
    this.turnIndex = 0
    this.transcriptValue = []
    this.choiceResultValue = null
    this.phaseValue = 'intro'
  }

  private revealCurrentTurn(): void {
    const turn = this.currentTurn
    if (!turn) {
      this.phaseValue = 'scenario-complete'
      return
    }

    if (turn.type === 'choice') {
      this.phaseValue = 'choice'
      return
    }

    this.transcriptValue.push({
      turnId: turn.id,
      speakerId: turn.speakerId,
      text: turn.text,
      translation: turn.translation,
      isPlayerChoice: false
    })
    this.phaseValue = 'conversation'
  }

  private createChoiceResult(
    choice: ConversationChoice
  ): ConversationChoiceResult {
    return {
      choiceId: choice.id,
      expression: choice.text,
      feedback: choice.feedback,
      rewards: choice.rewards ?? [],
      nextTurnId: choice.nextTurnId
    }
  }

  private validateScenario(
    experience: ConversationExperienceDefinition,
    scenario: ConversationScenarioDefinition
  ): void {
    if (scenario.experienceId !== experience.id) {
      throw new ConversationSequenceError(
        `子情景 "${scenario.id}" 的 experienceId 与会话体验不一致。`
      )
    }
    if (!scenario.turns.length) {
      throw new ConversationSequenceError(`子情景 "${scenario.id}" 没有对话。`)
    }

    const participantIds = new Set<string>()
    for (const participant of scenario.participants) {
      if (participantIds.has(participant.id)) {
        throw new ConversationSequenceError(
          `子情景 "${scenario.id}" 的参与者 ID "${participant.id}" 重复。`
        )
      }
      participantIds.add(participant.id)
    }

    const turnIds = new Set<string>()
    for (const turn of scenario.turns) {
      if (turnIds.has(turn.id)) {
        throw new ConversationSequenceError(
          `子情景 "${scenario.id}" 的步骤 ID "${turn.id}" 重复。`
        )
      }
      turnIds.add(turn.id)
    }

    for (const turn of scenario.turns) {
      if (!participantIds.has(turn.speakerId)) {
        throw new ConversationSequenceError(
          `步骤 "${turn.id}" 引用了不存在的参与者 "${turn.speakerId}"。`
        )
      }
      if (turn.type === 'choice') {
        const choiceIds = new Set<string>()
        for (const choice of turn.choices) {
          if (choiceIds.has(choice.id)) {
            throw new ConversationSequenceError(
              `步骤 "${turn.id}" 的选项 ID "${choice.id}" 重复。`
            )
          }
          choiceIds.add(choice.id)
          if (choice.nextTurnId && !turnIds.has(choice.nextTurnId)) {
            throw new ConversationSequenceError(
              `选项 "${choice.id}" 指向了不存在的步骤 "${choice.nextTurnId}"。`
            )
          }
        }
      }
    }
  }

  private getTurnIndex(turnId: string): number {
    const index = this.currentScenario?.turns.findIndex(
      (turn) => turn.id === turnId
    ) ?? -1
    if (index < 0) {
      throw new ConversationSequenceError(`步骤 "${turnId}" 不存在。`)
    }
    return index
  }
}
