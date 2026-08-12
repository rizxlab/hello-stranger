import type { ChoiceFeedback, StoryReward } from '@/scenes/types'

export interface ConversationExperienceDefinition {
  $schema?: string
  id: string
  seriesId: string
  kind: 'lesson' | 'standalone'
  number?: number
  title: string
  summary: string
  cover: string
  order: number
}

export interface ConversationParticipant {
  id: string
  name: string
  role: 'player' | 'partner'
}

export interface ConversationLineTurn {
  id: string
  type: 'line'
  speakerId: string
  text: string
  translation?: string
  endScenario?: boolean
}

export interface ConversationChoice {
  id: string
  text: string
  feedback: ChoiceFeedback
  rewards?: StoryReward[]
  nextTurnId?: string
}

export interface ConversationChoiceTurn {
  id: string
  type: 'choice'
  speakerId: string
  prompt: string
  choices: ConversationChoice[]
}

export type ConversationTurn = ConversationLineTurn | ConversationChoiceTurn

export interface ConversationScenarioDefinition {
  $schema?: string
  id: string
  experienceId: string
  title: string
  order: number
  setting: string
  background: string
  participants: ConversationParticipant[]
  turns: ConversationTurn[]
}
