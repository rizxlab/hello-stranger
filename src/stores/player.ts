import { defineStore } from 'pinia'
import type { EnglishSkill } from '@/scenes/types'

interface PlayerProgress {
  storyId: string | null
  chapterId: string | null
  sceneId: string | null
}

interface PlayerState {
  level: number
  english: Record<EnglishSkill, number>
  vocabulary: string[]
  relationships: Record<string, number>
  flags: Record<string, boolean>
  progress: PlayerProgress
}

function createInitialState(): PlayerState {
  return {
    level: 1,
    english: {
      speaking: 0,
      listening: 0,
      reading: 0,
      vocabulary: 0
    },
    vocabulary: [],
    relationships: {},
    flags: {},
    progress: {
      storyId: null,
      chapterId: null,
      sceneId: null
    }
  }
}

/** 当前运行会话中的统一玩家状态。初始 Demo 不写入 localStorage。 */
export const usePlayerStore = defineStore('player', {
  state: createInitialState,
  actions: {
    addEnglishSkill(skill: EnglishSkill, amount: number): void {
      this.english[skill] = Math.max(0, this.english[skill] + amount)
    },
    unlockVocabulary(words: readonly string[]): void {
      const vocabulary = new Set(this.vocabulary)
      for (const word of words) {
        vocabulary.add(word)
      }
      this.vocabulary = [...vocabulary]
      this.english.vocabulary = this.vocabulary.length
    },
    changeRelationship(characterId: string, amount: number): void {
      this.relationships[characterId] =
        (this.relationships[characterId] ?? 0) + amount
    },
    setFlag(flag: string, value: boolean): void {
      this.flags[flag] = value
    },
    setProgress(storyId: string, chapterId: string, sceneId: string): void {
      this.progress.storyId = storyId
      this.progress.chapterId = chapterId
      this.progress.sceneId = sceneId
    },
    resetPlayer(): void {
      this.$reset()
    }
  }
})
