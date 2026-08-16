import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from './player'

describe('player store reset', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('clears player progress and learned data without external storage', () => {
    const player = usePlayerStore()
    player.addEnglishSkill('speaking', 5)
    player.unlockVocabulary(['attachment'])
    player.changeRelationship('colleague', 2)
    player.setFlag('email-complete', true)
    player.setProgress('hello-stranger', 'chapter01', 'airport-checkin')

    player.resetPlayer()

    expect(player.level).toBe(1)
    expect(player.english).toEqual({
      speaking: 0,
      listening: 0,
      reading: 0,
      vocabulary: 0
    })
    expect(player.vocabulary).toEqual([])
    expect(player.relationships).toEqual({})
    expect(player.flags).toEqual({})
    expect(player.progress).toEqual({
      storyId: null,
      chapterId: null,
      sceneId: null
    })
  })
})
