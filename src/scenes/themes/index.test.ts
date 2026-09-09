import { describe, expect, it } from 'vitest'
import {
  getThemeCatalog,
  getThemeSection,
  getThemeTopic,
  listThemeCategories,
  listThemeSections
} from './index'

describe('theme catalog registry', () => {
  it('registers all theme categories in catalog-number order', () => {
    const themes = listThemeCategories()

    expect(themes).toHaveLength(35)
    expect(themes.map((theme) => theme.catalogNumber)).toEqual(
      Array.from({ length: 35 }, (_, index) => String(index + 1).padStart(2, '0'))
    )
    expect(themes[0]).toMatchObject({
      id: 'accommodation',
      title: '住宿',
      eyebrow: 'Accommodation'
    })
    expect(themes[3]).toMatchObject({
      id: 'restaurant-dining',
      title: '餐厅与吃饭',
      eyebrow: 'Restaurants & Dining'
    })
  })

  it('keeps every four-level catalog linked and uniquely identified', () => {
    const sectionIds = new Set<string>()
    const topicIds = new Set<string>()
    const chapterIds = new Set<string>()
    let sectionCount = 0
    let topicCount = 0
    let chapterCount = 0
    let availableChapterCount = 0

    for (const theme of listThemeCategories()) {
      expect(getThemeCatalog(theme.id)?.themeId).toBe(theme.id)

      for (const section of listThemeSections(theme.id)) {
        expect(sectionIds.has(section.id)).toBe(false)
        sectionIds.add(section.id)
        sectionCount += 1

        for (const topic of section.topics) {
          expect(topicIds.has(topic.id)).toBe(false)
          topicIds.add(topic.id)
          topicCount += 1

          for (const chapter of topic.chapters) {
            expect(chapterIds.has(chapter.id)).toBe(false)
            chapterIds.add(chapter.id)
            chapterCount += 1
            if (chapter.status === 'available') availableChapterCount += 1
          }
        }
      }
    }

    expect({ sectionCount, topicCount, chapterCount, availableChapterCount }).toEqual({
      sectionCount: 119,
      topicCount: 327,
      chapterCount: 1014,
      availableChapterCount: 1014
    })
  })

  it('publishes the supplied content for themes 01 to 35', () => {
    const expectedAvailability = new Map([
      ['accommodation', { available: 136, planned: 0 }],
      ['airport-flight', { available: 64, planned: 0 }],
      ['public-transportation', { available: 42, planned: 0 }],
      ['restaurant-dining', { available: 49, planned: 0 }],
      ['cafes-fast-food-delivery', { available: 25, planned: 0 }],
      ['shopping', { available: 27, planned: 0 }],
      ['grocery-shopping', { available: 16, planned: 0 }],
      ['directions-getting-around', { available: 15, planned: 0 }],
      ['sightseeing', { available: 21, planned: 0 }],
      ['renting-living', { available: 30, planned: 0 }],
      ['neighborhood', { available: 18, planned: 0 }],
      ['workplace', { available: 43, planned: 0 }],
      ['school-study', { available: 24, planned: 0 }],
      ['friends-social-life', { available: 34, planned: 0 }],
      ['dating-relationships', { available: 33, planned: 0 }],
      ['party-nightlife', { available: 21, planned: 0 }],
      ['medical-situations', { available: 19, planned: 0 }],
      ['emergencies', { available: 21, planned: 0 }],
      ['banking-money', { available: 18, planned: 0 }],
      ['phone-internet', { available: 15, planned: 0 }],
      ['delivery-post-office', { available: 12, planned: 0 }],
      ['personal-services', { available: 18, planned: 0 }],
      ['fitness-sports', { available: 15, planned: 0 }],
      ['driving-car-rental', { available: 21, planned: 0 }],
      ['public-services', { available: 12, planned: 0 }],
      ['entertainment', { available: 24, planned: 0 }],
      ['travel-problems', { available: 24, planned: 0 }],
      ['cultural-differences', { available: 15, planned: 0 }],
      ['everyday-problems', { available: 18, planned: 0 }],
      ['conflict-boundaries', { available: 18, planned: 0 }],
      ['stranger-encounters', { available: 25, planned: 0 }],
      ['phone-calls', { available: 24, planned: 0 }],
      ['texting-messaging', { available: 18, planned: 0 }],
      ['life-events', { available: 21, planned: 0 }],
      ['drama-real-life', { available: 78, planned: 0 }]
    ])

    for (const [themeId, expected] of expectedAvailability) {
      const chapters = listThemeSections(themeId).flatMap((section) =>
        section.topics.flatMap((topic) => topic.chapters)
      )
      expect(chapters.filter((chapter) => chapter.status === 'available')).toHaveLength(
        expected.available
      )
      expect(chapters.filter((chapter) => chapter.status === 'planned')).toHaveLength(
        expected.planned
      )
    }

    expect(getThemeTopic('accommodation', '01.2', '01.2.02')?.chapters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'A',
          status: 'available',
          experienceId: 'accommodation-01-2-02-a'
        }),
        expect.objectContaining({ code: 'B', status: 'available' }),
        expect.objectContaining({ code: 'C', status: 'available' })
      ])
    )
  })

  it('resolves every directory level and normalizes phone practice', () => {
    expect(getThemeSection('accommodation', '01.1')?.title).toBe('预订 Booking')
    expect(getThemeTopic('accommodation', '01.1', '01.1.01')).toMatchObject({
      title: '电话预订房间 Making a Reservation by Phone',
      chapters: expect.arrayContaining([
        expect.objectContaining({
          code: 'A',
          title: '正常完成预订',
          status: 'available',
          experienceId: 'accommodation-01-1-01-a'
        })
      ])
    })
    expect(getThemeTopic('phone-calls', '32.4', '32.4.01')).toMatchObject({
      title: '电话综合训练',
      chapters: expect.arrayContaining([
        expect.objectContaining({ code: 'E', title: '房东 / 维修' })
      ])
    })
  })
})
