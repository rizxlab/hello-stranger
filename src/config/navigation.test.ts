import { describe, expect, it } from 'vitest'
import { navigationItems } from './navigation'

describe('primary navigation', () => {
  it('places themes between stories and short scenes', () => {
    expect(navigationItems.map((item) => item.routeName)).toEqual([
      'home',
      'stories',
      'themes',
      'short-scenes',
      'profile'
    ])
    expect(navigationItems[2]?.label).toBe('主题分类')
  })
})
