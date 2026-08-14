import { describe, expect, it } from 'vitest'
import {
  getShortScene,
  getShortSceneSeries,
  listShortScenes,
  listShortSceneSeries
} from './index'

describe('short scene registry', () => {
  it('keeps independent scenes separate from series entries', () => {
    expect(listShortScenes(null)).toEqual([])
    expect(listShortScenes('dk-conversations')).toEqual([])
    expect(getShortScene('boarding-gate-confirmation')).toBeNull()
    expect(getShortScene('metro-directions')).toBeNull()
  })

  it('registers DK as a conversation lesson series', () => {
    expect(listShortSceneSeries()).toHaveLength(2)
    expect(getShortSceneSeries('dk-conversations')?.title).toBe('DK英语会话')
    expect(getShortSceneSeries('dk-conversations')?.contentType).toBe(
      'conversation-experiences'
    )
    expect(getShortScene('dk-first-meeting')).toBeNull()
    expect(getShortSceneSeries('common-conversations')?.title).toBe(
      '常见情景会话'
    )
  })
})
