import { describe, expect, it } from 'vitest'
import {
  getConversationExperience,
  listConversationExperiences,
  listConversationScenarios
} from '@/scenes/conversations'
import { ConversationSequenceSystem } from './ConversationSequenceSystem'

describe('ConversationSequenceSystem', () => {
  it('registers lesson 15 with its first scenario', () => {
    const experiences = listConversationExperiences('dk-conversations')
    expect(experiences).toHaveLength(93)
    expect(experiences.map((experience) => experience.number)).toEqual([
      ...Array.from({ length: 52 }, (_, index) => index + 1),
      ...Array.from({ length: 41 }, (_, index) => index + 56)
    ])
    expect(getConversationExperience('dk-lesson-15')?.title).toBe(
      'Talking About Family'
    )
    const scenarios = listConversationScenarios('dk-lesson-15')
    expect(scenarios).toHaveLength(1)
    const scenario = scenarios[0]
    expect(scenario?.background).toBe('dk-family-cafe')
    const partnerId = scenario?.participants.find(
      (participant) => participant.role === 'partner'
    )?.id
    const partnerLines = scenario?.turns.filter(
      (turn) => turn.type === 'line' && turn.speakerId === partnerId
    ) ?? []
    expect(
      partnerLines.every(
        (line) => line.type === 'line' && line.translation === undefined
      )
    ).toBe(true)
  })

  it('registers and completes the first scenario of lessons 88 to 96', () => {
    for (let lessonNumber = 88; lessonNumber <= 96; lessonNumber += 1) {
      const experience = getConversationExperience(`dk-lesson-${lessonNumber}`)
      expect(experience?.number).toBe(lessonNumber)
      if (!experience) continue

      const scenarios = listConversationScenarios(experience.id)
      expect(scenarios).toHaveLength(1)
      expect(scenarios[0]?.order).toBe(1)

      const system = new ConversationSequenceSystem()
      system.loadExperience(experience, scenarios)
      system.beginScenario()

      let steps = 0
      while (system.phase !== 'scenario-complete' && steps < 12) {
        if (system.phase === 'choice') {
          const firstChoice = system.currentChoiceTurn?.choices[0]
          expect(firstChoice).toBeDefined()
          if (firstChoice) system.selectChoice(firstChoice.id)
        } else if (system.phase === 'feedback') {
          system.continueAfterFeedback()
        } else if (system.phase === 'conversation') {
          system.advanceConversation()
        }
        steps += 1
      }

      expect(system.phase).toBe('scenario-complete')
    }
  })

  it('registers one playable scenario for every added catalog lesson', () => {
    const catalogNumbers = [
      ...Array.from({ length: 14 }, (_, index) => index + 1),
      ...Array.from({ length: 37 }, (_, index) => index + 16),
      ...Array.from({ length: 32 }, (_, index) => index + 56)
    ]

    for (const lessonNumber of catalogNumbers) {
      const experience = getConversationExperience(`dk-lesson-${lessonNumber}`)
      expect(experience?.number).toBe(lessonNumber)
      if (!experience) continue

      const scenarios = listConversationScenarios(experience.id)
      expect(scenarios).toHaveLength(1)
      expect(scenarios[0]?.turns.some((turn) => turn.type === 'choice')).toBe(true)
      expect(scenarios[0]?.turns.at(-1)).toMatchObject({ endScenario: true })
    }
  })

  it('runs a continuous conversation through two choice points', () => {
    const experience = getConversationExperience('dk-lesson-15')
    expect(experience).not.toBeNull()
    if (!experience) return

    const system = new ConversationSequenceSystem()
    system.loadExperience(
      experience,
      listConversationScenarios(experience.id)
    )
    expect(system.phase).toBe('intro')

    system.beginScenario()
    expect(system.phase).toBe('choice')
    system.selectChoice('ask-natural')
    expect(system.phase).toBe('feedback')
    expect(system.transcript[0]?.text).toBe(
      'Do you have any brothers or sisters?'
    )

    system.continueAfterFeedback()
    expect(system.phase).toBe('conversation')
    const transcriptBeforeAdvance = system.transcript
    system.advanceConversation()
    expect(system.transcript).toHaveLength(3)
    expect(system.transcript).not.toBe(transcriptBeforeAdvance)
    expect(system.transcript[2]?.text).toBe(
      'How about you? Do you have any brothers or sisters?'
    )
    system.advanceConversation()
    expect(system.phase).toBe('choice')

    system.selectChoice('answer-only-child')
    system.continueAfterFeedback()
    expect(system.phase).toBe('conversation')
    system.advanceConversation()
    expect(system.phase).toBe('scenario-complete')
    expect(system.hasNextScenario).toBe(false)
  })

  it('branches to a respectful response when the player declines to answer', () => {
    const experience = getConversationExperience('dk-lesson-15')
    expect(experience).not.toBeNull()
    if (!experience) return

    const system = new ConversationSequenceSystem()
    system.loadExperience(
      experience,
      listConversationScenarios(experience.id)
    )
    system.beginScenario()
    system.selectChoice('ask-natural')
    system.continueAfterFeedback()
    system.advanceConversation()
    system.advanceConversation()

    const result = system.selectChoice('answer-private')
    expect(result.expression).toBe("I'd rather not say.")
    expect(result.feedback.naturalness).toBe(5)
    expect(result.nextTurnId).toBe('friend-respects-boundary')

    system.continueAfterFeedback()
    expect(system.transcript.at(-1)?.text).toBe('No worries. I understand.')
    system.advanceConversation()
    expect(system.phase).toBe('scenario-complete')
  })

  it('returns from feedback to the same choices and only confirms once', () => {
    const experience = getConversationExperience('dk-lesson-15')
    expect(experience).not.toBeNull()
    if (!experience) return

    const system = new ConversationSequenceSystem()
    system.loadExperience(
      experience,
      listConversationScenarios(experience.id)
    )
    system.beginScenario()

    const firstResult = system.selectChoice('ask-unnatural')
    expect(system.transcript.at(-1)?.text).toBe(
      'Are you having brothers or sisters?'
    )
    system.returnToChoice()

    expect(system.phase).toBe('choice')
    expect(system.choiceResult).toBeNull()
    expect(system.transcript).toHaveLength(0)

    const confirmedChoice = system.selectChoice('ask-natural')
    const confirmedResult = system.continueAfterFeedback()
    expect(confirmedResult).toEqual(confirmedChoice)
    expect(confirmedResult).not.toEqual(firstResult)
    expect(() => system.continueAfterFeedback()).toThrow(
      '当前没有等待继续的学习反馈。'
    )
  })

  it('registers migrated common conversations as standalone experiences', () => {
    const experiences = listConversationExperiences('common-conversations')
    expect(experiences.map((experience) => experience.id)).toEqual([
      'boarding-gate-confirmation',
      'metro-directions'
    ])
    expect(experiences.every((experience) => experience.kind === 'standalone')).toBe(true)
    expect(listConversationScenarios('boarding-gate-confirmation')).toHaveLength(1)
    expect(listConversationScenarios('metro-directions')).toHaveLength(1)
  })

  it('plays a migrated common conversation without actor hotspots', () => {
    const experience = getConversationExperience('boarding-gate-confirmation')
    expect(experience).not.toBeNull()
    if (!experience) return

    const system = new ConversationSequenceSystem()
    system.loadExperience(
      experience,
      listConversationScenarios(experience.id)
    )
    system.beginScenario()
    expect(system.phase).toBe('conversation')
    expect(system.transcript.at(-1)?.text).toBe(
      'Good evening. Are you looking for a flight?'
    )
    system.advanceConversation()
    expect(system.phase).toBe('choice')
    system.selectChoice('gate-natural')
    system.continueAfterFeedback()
    expect(system.transcript.at(-1)?.text).toBe(
      'Yes, it is. Boarding starts in ten minutes.'
    )
    system.advanceConversation()
    expect(system.phase).toBe('scenario-complete')
  })
})
