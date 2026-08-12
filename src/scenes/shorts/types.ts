import type { StoryChapter } from '@/scenes/types'

export interface ShortSceneCompletion {
  title: string
  description: string
}

/** 短情景的目录信息与可播放章节数据。 */
export interface ShortSceneDefinition {
  $schema?: string
  id: string
  seriesId?: string
  title: string
  summary: string
  category: string
  durationMinutes: number
  level: string
  skills: string[]
  cover: string
  order: number
  completion: ShortSceneCompletion
  chapter: StoryChapter
}

/** 一组可持续增加会话条目的短情景栏目。 */
export interface ShortSceneSeriesDefinition {
  $schema?: string
  id: string
  title: string
  summary: string
  eyebrow: string
  experienceLabel: string
  contentType: 'short-scenes' | 'conversation-experiences'
  cover: string
  order: number
}
