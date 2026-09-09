import { describe, expect, it } from 'vitest'
import {
  findNextAvailableExperienceId,
  getNextConversationExperienceId
} from './ConversationNavigationSystem'

describe('ConversationNavigationSystem', () => {
  it('continues through theme chapters in catalog order', () => {
    expect(
      getNextConversationExperienceId(
        'accommodation',
        'accommodation-01-2-01-a'
      )
    ).toBe('accommodation-01-2-01-b')
  })

  it('continues across topic boundaries', () => {
    expect(
      getNextConversationExperienceId(
        'accommodation',
        'accommodation-01-2-01-c'
      )
    ).toBe('accommodation-01-2-02-a')
  })

  it('skips unavailable entries', () => {
    expect(
      findNextAvailableExperienceId(
        [
          { experienceId: 'current', available: true },
          { available: false },
          { experienceId: 'next', available: true }
        ],
        'current'
      )
    ).toBe('next')
  })

  it('returns null after the final conversation', () => {
    expect(
      getNextConversationExperienceId(
        'drama-real-life',
        'drama-real-life-35-4-06-c'
      )
    ).toBeNull()
  })
})
