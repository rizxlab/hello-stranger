import { computed, ref } from 'vue'
import type {
  ConversationExperienceDefinition,
  ConversationScenarioDefinition
} from '@/scenes/conversations/types'
import { usePlayerStore } from '@/stores/player'
import { ConversationSequenceSystem } from '@/systems/ConversationSequenceSystem'
import { RewardSystem } from '@/systems/RewardSystem'

export function useConversationSession() {
  const player = usePlayerStore()
  const sequence = new ConversationSequenceSystem()
  const rewards = new RewardSystem()
  const revision = ref(0)

  function refresh(): void {
    revision.value += 1
  }

  const phase = computed(() => {
    revision.value
    return sequence.phase
  })
  const experience = computed(() => {
    revision.value
    return sequence.experience
  })
  const scenarios = computed(() => {
    revision.value
    return sequence.scenarios
  })
  const currentScenario = computed(() => {
    revision.value
    return sequence.currentScenario
  })
  const currentScenarioIndex = computed(() => {
    revision.value
    return sequence.currentScenarioIndex
  })
  const transcript = computed(() => {
    revision.value
    return sequence.transcript
  })
  const currentChoiceTurn = computed(() => {
    revision.value
    return sequence.currentChoiceTurn
  })
  const choiceResult = computed(() => {
    revision.value
    return sequence.choiceResult
  })
  const hasNextScenario = computed(() => {
    revision.value
    return sequence.hasNextScenario
  })

  function loadExperience(
    selectedExperience: ConversationExperienceDefinition,
    experienceScenarios: readonly ConversationScenarioDefinition[],
    startScenarioId?: string
  ): void {
    sequence.loadExperience(
      selectedExperience,
      experienceScenarios,
      startScenarioId
    )
    refresh()
  }

  function selectChoice(choiceId: string): void {
    sequence.selectChoice(choiceId)
    refresh()
  }

  function continueAfterFeedback(): void {
    const confirmedResult = sequence.continueAfterFeedback()
    rewards.applyRewards(confirmedResult.rewards, player)
    refresh()
  }

  function run(action: () => void): void {
    action()
    refresh()
  }

  return {
    player,
    phase,
    experience,
    scenarios,
    currentScenario,
    currentScenarioIndex,
    transcript,
    currentChoiceTurn,
    choiceResult,
    hasNextScenario,
    loadExperience,
    clear: () => run(() => sequence.clear()),
    beginScenario: () => run(() => sequence.beginScenario()),
    advanceConversation: () => run(() => sequence.advanceConversation()),
    selectChoice,
    returnToChoice: () => run(() => sequence.returnToChoice()),
    continueAfterFeedback,
    goToScenario: (scenarioId: string) =>
      run(() => sequence.goToScenario(scenarioId)),
    goToNextScenario: () => run(() => sequence.goToNextScenario()),
    restartScenario: () => run(() => sequence.restartScenario())
  }
}
