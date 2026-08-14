import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getConversationExperience,
  listConversationScenarios
} from '@/scenes/conversations'
import { useConversationSession } from './useConversationSession'

describe('useConversationSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not grant rewards before confirmation or when returning to choices', () => {
    const experience = getConversationExperience('dk-lesson-15')
    expect(experience).not.toBeNull()
    if (!experience) return

    const session = useConversationSession()
    session.loadExperience(
      experience,
      listConversationScenarios(experience.id)
    )
    session.beginScenario()

    session.selectChoice('ask-unnatural')
    expect(session.player.english.speaking).toBe(0)
    session.returnToChoice()
    expect(session.player.english.speaking).toBe(0)

    session.selectChoice('ask-natural')
    expect(session.player.english.speaking).toBe(0)
    session.continueAfterFeedback()
    expect(session.player.english.speaking).toBe(3)
    expect(session.player.vocabulary).toEqual([
      'brother',
      'sister',
      'siblings'
    ])
  })
})
