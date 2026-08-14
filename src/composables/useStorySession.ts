import { computed, ref, shallowRef } from 'vue'
import type {
  DialogueLine,
  StoryChapter,
  StoryChoice,
  StoryNode,
  StoryScene
} from '@/scenes/types'
import { usePlayerStore } from '@/stores/player'
import { ChoiceSystem, type ChoiceResult } from '@/systems/ChoiceSystem'
import { DialogueSystem } from '@/systems/DialogueSystem'
import { RewardSystem } from '@/systems/RewardSystem'
import { SceneSystem } from '@/systems/SceneSystem'
import {
  StorySystem,
  type StoryPlayerContext
} from '@/systems/StorySystem'

export type StoryPhase =
  | 'empty'
  | 'scene'
  | 'dialogue'
  | 'choices'
  | 'feedback'
  | 'complete'

/** 编排独立剧情系统，为页面提供稳定、可测试的会话接口。 */
export function useStorySession() {
  const player = usePlayerStore()
  const storySystem = new StorySystem()
  const sceneSystem = new SceneSystem()
  const dialogueSystem = new DialogueSystem()
  const choiceSystem = new ChoiceSystem()
  const rewardSystem = new RewardSystem()

  const phase = ref<StoryPhase>('empty')
  const chapter = shallowRef<StoryChapter | null>(null)
  const currentScene = shallowRef<StoryScene | null>(null)
  const currentNode = shallowRef<StoryNode | null>(null)
  const currentLine = shallowRef<DialogueLine | null>(null)
  const availableChoices = shallowRef<readonly StoryChoice[]>([])
  const choiceResult = shallowRef<ChoiceResult | null>(null)
  const interactionCommitted = ref(false)
  const sceneRevision = ref(0)

  const currentCharacter = computed(() => {
    const speakerId = currentLine.value?.speakerId
    return speakerId ? storySystem.getCharacter(speakerId) : null
  })

  const canAdvanceScene = computed(
    () => {
      sceneRevision.value
      return currentScene.value !== null && sceneSystem.canAdvance
    }
  )

  const nextScene = computed(() => {
    const nextId = currentScene.value?.nextSceneId
    return nextId
      ? chapter.value?.scenes.find((scene) => scene.id === nextId) ?? null
      : null
  })

  const canCloseInteraction = computed(
    () => !interactionCommitted.value && phase.value !== 'feedback'
  )

  function playerContext(): StoryPlayerContext {
    return {
      english: player.english,
      vocabulary: player.vocabulary,
      relationships: player.relationships,
      flags: player.flags
    }
  }

  function clearDialogueState(): void {
    dialogueSystem.clear()
    choiceSystem.clear()
    currentNode.value = null
    currentLine.value = null
    availableChoices.value = []
    choiceResult.value = null
    interactionCommitted.value = false
  }

  function enterNode(node: StoryNode): void {
    currentNode.value = node
    choiceResult.value = null
    availableChoices.value = []
    choiceSystem.clear()
    currentLine.value = dialogueSystem.loadDialogue(node.dialogue)
    phase.value = currentLine.value ? 'dialogue' : 'scene'
  }

  function loadChapter(selectedChapter: StoryChapter): void {
    chapter.value = selectedChapter
    storySystem.loadChapter(selectedChapter)
    currentScene.value = sceneSystem.loadChapter(selectedChapter)
    sceneRevision.value += 1
    clearDialogueState()
    player.setProgress(
      selectedChapter.storyId,
      selectedChapter.id,
      currentScene.value.id
    )
    phase.value = 'scene'
  }

  function clear(): void {
    storySystem.unloadChapter()
    sceneSystem.clear()
    chapter.value = null
    currentScene.value = null
    sceneRevision.value += 1
    clearDialogueState()
    phase.value = 'empty'
  }

  function interactWithActor(actorId: string): void {
    const actor = sceneSystem.activateActor(actorId)
    interactionCommitted.value = false
    enterNode(storySystem.goToNode(actor.interaction.targetId))
  }

  function finishInteraction(): void {
    const completion = sceneSystem.completeActiveInteraction()
    sceneRevision.value += 1
    clearDialogueState()
    phase.value = completion.chapterComplete ? 'complete' : 'scene'
  }

  function finishDialogue(): void {
    const choices = storySystem.getAvailableChoices(playerContext())

    if (choices.length) {
      availableChoices.value = choiceSystem.loadChoices(choices)
      phase.value = 'choices'
      return
    }

    if (currentNode.value?.nextNodeId) {
      enterNode(storySystem.advanceToNextNode())
      return
    }

    finishInteraction()
  }

  function advanceDialogue(): void {
    currentLine.value = dialogueSystem.advance()
    if (!currentLine.value) {
      finishDialogue()
    }
  }

  function selectChoice(choiceId: string): void {
    const result = choiceSystem.selectChoice(choiceId)
    rewardSystem.applyRewards(result.rewards, player)
    interactionCommitted.value = true
    choiceResult.value = result
    phase.value = 'feedback'
  }

  function continueAfterFeedback(): void {
    if (choiceResult.value) {
      enterNode(storySystem.goToNode(choiceResult.value.nextNodeId))
      interactionCommitted.value = true
    }
  }

  function closeInteraction(): void {
    if (!canCloseInteraction.value) {
      return
    }
    sceneSystem.cancelActiveInteraction()
    clearDialogueState()
    phase.value = 'scene'
  }

  function advanceScene(): void {
    currentScene.value = sceneSystem.advanceScene()
    sceneRevision.value += 1
    const selectedChapter = chapter.value
    if (selectedChapter) {
      player.setProgress(
        selectedChapter.storyId,
        selectedChapter.id,
        currentScene.value.id
      )
    }
    phase.value = 'scene'
  }

  function restartChapter(): void {
    const selectedChapter = chapter.value
    if (!selectedChapter) {
      return
    }
    player.resetPlayer()
    loadChapter(selectedChapter)
  }

  return {
    player,
    phase,
    chapter,
    currentScene,
    currentNode,
    currentLine,
    currentCharacter,
    availableChoices,
    choiceResult,
    canAdvanceScene,
    nextScene,
    canCloseInteraction,
    sceneRevision,
    getCharacter: (characterId: string) =>
      storySystem.getCharacter(characterId),
    hasCompletedActor: (actorId: string) =>
      sceneSystem.hasCompletedActor(actorId),
    loadChapter,
    clear,
    interactWithActor,
    advanceDialogue,
    selectChoice,
    continueAfterFeedback,
    closeInteraction,
    advanceScene,
    restartChapter
  }
}
