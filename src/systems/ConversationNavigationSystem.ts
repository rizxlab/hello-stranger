import { listConversationExperiences } from '@/scenes/conversations'
import { getThemeCategory, listThemeSections } from '@/scenes/themes'

export interface OrderedConversationItem {
  experienceId?: string
  available: boolean
}

export function findNextAvailableExperienceId(
  items: OrderedConversationItem[],
  currentExperienceId: string
): string | null {
  const currentIndex = items.findIndex(
    (item) => item.experienceId === currentExperienceId
  )
  if (currentIndex < 0) return null

  return (
    items
      .slice(currentIndex + 1)
      .find((item) => item.available && item.experienceId)
      ?.experienceId ?? null
  )
}

export function getNextConversationExperienceId(
  seriesId: string,
  currentExperienceId: string
): string | null {
  if (getThemeCategory(seriesId)) {
    const chapters = listThemeSections(seriesId).flatMap((section) =>
      section.topics.flatMap((topic) =>
        topic.chapters.map((chapter) => ({
          experienceId: chapter.experienceId,
          available: chapter.status === 'available'
        }))
      )
    )
    return findNextAvailableExperienceId(chapters, currentExperienceId)
  }

  const experiences = listConversationExperiences(seriesId).map(
    (experience) => ({
      experienceId: experience.id,
      available: true
    })
  )
  return findNextAvailableExperienceId(experiences, currentExperienceId)
}
