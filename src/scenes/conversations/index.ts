import type {
  ConversationExperienceDefinition,
  ConversationLessonCatalog,
  ConversationLessonCatalogEntry,
  ConversationScenarioDefinition
} from './types'

const experienceModules = import.meta.glob<ConversationExperienceDefinition>(
  [
    '../shorts/series/*/lessons/*/lesson.json',
    '../shorts/series/*/conversations/*/conversation.json'
  ],
  { eager: true, import: 'default' }
)

const scenarioModules = import.meta.glob<ConversationScenarioDefinition>(
  [
    '../shorts/series/*/lessons/*/scenarios/*.json',
    '../shorts/series/*/conversations/*/scenarios/*.json'
  ],
  { eager: true, import: 'default' }
)

const lessonCatalogModules = import.meta.glob<ConversationLessonCatalog>(
  '../shorts/series/*/lesson-catalogs/*.json',
  { eager: true, import: 'default' }
)

function lessonId(number: number): string {
  return `dk-lesson-${number}`
}

function coverForLesson(number: number): string {
  if (number >= 65 && number <= 67) return 'metro-station'
  if (number >= 68 && number <= 79) return 'boarding-gate'
  if (number === 63 || number === 84 || number === 85) return 'airport-security'
  return 'dk-family-cafe'
}

function expandCatalogLesson(
  seriesId: string,
  lesson: ConversationLessonCatalogEntry
): {
  experience: ConversationExperienceDefinition
  scenario: ConversationScenarioDefinition
} {
  const id = lessonId(lesson.number)
  const cover = lesson.cover ?? coverForLesson(lesson.number)
  return {
    experience: {
      id,
      seriesId,
      kind: 'lesson',
      number: lesson.number,
      title: lesson.title,
      summary: `通过一个简短情景练习 ${lesson.title} 主题中的自然英语表达。`,
      cover,
      order: lesson.number
    },
    scenario: {
      id: `${id}-scenario-01`,
      experienceId: id,
      title: lesson.natural,
      order: 1,
      setting: lesson.setting,
      background: cover,
      participants: [
        { id: 'player', name: '你', role: 'player' },
        { id: 'partner', name: lesson.partnerName, role: 'partner' }
      ],
      turns: [
        {
          id: 'partner-opens',
          type: 'line',
          speakerId: 'partner',
          text: lesson.opening
        },
        {
          id: 'player-responds',
          type: 'choice',
          speakerId: 'player',
          prompt: lesson.prompt,
          choices: [
            {
              id: 'natural',
              text: lesson.natural,
              feedback: {
                naturalness: 5,
                assessment: '非常自然',
                naturalExpression: lesson.natural,
                explanation: lesson.tip
              },
              rewards: [
                { type: 'stat', stat: 'speaking', amount: 3 },
                { type: 'vocabulary', words: lesson.vocabulary }
              ]
            },
            {
              id: 'alternative',
              text: lesson.alternative,
              feedback: {
                naturalness: 4,
                assessment: '自然、可以使用',
                naturalExpression: lesson.natural,
                explanation: `这种说法可以理解并用于当前情景；更推荐记住：${lesson.natural}`
              },
              rewards: [{ type: 'stat', stat: 'speaking', amount: 2 }]
            },
            {
              id: 'awkward',
              text: lesson.awkward,
              feedback: {
                naturalness: 2,
                assessment: '可以猜出意思，但不够自然',
                naturalExpression: lesson.natural,
                explanation: `${lesson.tip} 建议使用上面的自然表达。`
              },
              rewards: [{ type: 'stat', stat: 'speaking', amount: 1 }]
            }
          ]
        },
        {
          id: 'partner-responds',
          type: 'line',
          speakerId: 'partner',
          text: lesson.response,
          endScenario: true
        }
      ]
    }
  }
}

const catalogLessons = Object.values(lessonCatalogModules).flatMap((catalog) =>
  catalog.lessons.map((lesson) => expandCatalogLesson(catalog.seriesId, lesson))
)

function createRegistry<T extends { id: string }>(
  entries: T[],
  label: string
): Readonly<Record<string, T>> {
  return Object.freeze(entries.reduce<Record<string, T>>((registry, entry) => {
    if (registry[entry.id]) {
      throw new Error(`${label} ID "${entry.id}" 重复。`)
    }
    registry[entry.id] = entry
    return registry
  }, {}))
}

const experienceRegistry = createRegistry(
  [
    ...Object.values(experienceModules),
    ...catalogLessons.map(({ experience }) => experience)
  ],
  '会话体验'
)
const scenarioRegistry = createRegistry(
  [
    ...Object.values(scenarioModules),
    ...catalogLessons.map(({ scenario }) => scenario)
  ],
  '会话子情景'
)

export function listConversationExperiences(
  seriesId: string
): ConversationExperienceDefinition[] {
  return Object.values(experienceRegistry)
    .filter((experience) => experience.seriesId === seriesId)
    .sort((a, b) => a.order - b.order)
}

export function getConversationExperience(
  experienceId: string
): ConversationExperienceDefinition | null {
  return experienceRegistry[experienceId] ?? null
}

export function listConversationScenarios(
  experienceId: string
): ConversationScenarioDefinition[] {
  return Object.values(scenarioRegistry)
    .filter((scenario) => scenario.experienceId === experienceId)
    .sort((a, b) => a.order - b.order)
}

export function getConversationScenario(
  scenarioId: string
): ConversationScenarioDefinition | null {
  return scenarioRegistry[scenarioId] ?? null
}
