import { describe, expect, it } from 'vitest'
import { listThemeSections } from '@/scenes/themes'
import { ConversationSequenceSystem } from '@/systems/ConversationSequenceSystem'
import {
  getConversationExperience,
  getConversationScenario,
  loadConversationExperience,
  listConversationExperiences,
  listConversationScenarios
} from './index'

const populatedThemeIds = [
  'accommodation',
  'airport-flight',
  'public-transportation',
  'restaurant-dining',
  'cafes-fast-food-delivery',
  'shopping',
  'grocery-shopping',
  'directions-getting-around',
  'sightseeing',
  'renting-living',
  'neighborhood',
  'workplace',
  'school-study',
  'friends-social-life',
  'dating-relationships',
  'party-nightlife',
  'medical-situations',
  'emergencies',
  'banking-money',
  'phone-internet',
  'delivery-post-office',
  'personal-services',
  'fitness-sports',
  'driving-car-rental',
  'public-services',
  'entertainment',
  'travel-problems',
  'cultural-differences',
  'everyday-problems',
  'conflict-boundaries',
  'stranger-encounters',
  'phone-calls',
  'texting-messaging',
  'life-events',
  'drama-real-life'
]

async function loadAllAvailableThemeExperiences(): Promise<void> {
  const requests = populatedThemeIds.flatMap((themeId) =>
    listThemeSections(themeId).flatMap((section) =>
      section.topics.flatMap((topic) =>
        topic.chapters
          .filter((chapter) => chapter.status === 'available')
          .map((chapter) =>
            loadConversationExperience(themeId, chapter.experienceId ?? '')
          )
      )
    )
  )
  await Promise.all(requests)
}

describe('theme conversation content registry', () => {
  it('registers all 1014 supplied theme chapters', async () => {
    await loadAllAvailableThemeExperiences()
    const experiences = populatedThemeIds.flatMap((themeId) =>
      listConversationExperiences(themeId)
    )

    expect(experiences).toHaveLength(1014)
    expect(new Set(experiences.map((experience) => experience.id)).size).toBe(1014)
  })

  it('links every available catalog chapter to a valid playable scenario', async () => {
    await loadAllAvailableThemeExperiences()
    let linkedChapterCount = 0

    for (const themeId of populatedThemeIds) {
      for (const section of listThemeSections(themeId)) {
        for (const topic of section.topics) {
          for (const chapter of topic.chapters) {
            if (chapter.status !== 'available') continue

            const experience = getConversationExperience(chapter.experienceId ?? '')
            const scenario = getConversationScenario(chapter.scenarioId ?? '')

            expect(experience?.seriesId).toBe(themeId)
            expect(scenario?.experienceId).toBe(experience?.id)
            expect(scenario?.turns.some((turn) => turn.type === 'choice')).toBe(true)

            const sequence = new ConversationSequenceSystem()
            sequence.loadExperience(
              experience!,
              listConversationScenarios(experience!.id),
              scenario!.id
            )
            expect(sequence.phase).toBe('intro')
            linkedChapterCount += 1
          }
        }
      }
    }

    expect(linkedChapterCount).toBe(1014)
  })

  it('keeps the self-checkout reading flow interactive without inventing spoken dialogue', async () => {
    const experienceId = 'grocery-shopping-07-2-02-a'
    await loadConversationExperience('grocery-shopping', experienceId)

    expect(
      getConversationScenario(`${experienceId}-scenario-01`)
    ).toMatchObject({
      participants: expect.arrayContaining([
        expect.objectContaining({ id: 'partner', name: '屏幕' })
      ]),
      turns: expect.arrayContaining([
        expect.objectContaining({
          type: 'choice',
          prompt: '选择一种付款方式。',
          choices: expect.arrayContaining([
            expect.objectContaining({ text: 'Card' }),
            expect.objectContaining({ text: 'Mobile Payment' })
          ])
        })
      ])
    })
  })
})
