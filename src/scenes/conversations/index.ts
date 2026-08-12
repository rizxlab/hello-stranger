import type {
  ConversationExperienceDefinition,
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
  Object.values(experienceModules),
  '会话体验'
)
const scenarioRegistry = createRegistry(
  Object.values(scenarioModules),
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
