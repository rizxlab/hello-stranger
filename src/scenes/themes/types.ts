export interface ThemeCategoryDefinition {
  $schema?: string
  id: string
  catalogNumber: string
  title: string
  summary?: string
  eyebrow: string
  experienceLabel?: string
  cover?: string
  order: number
}

export type ThemeChapterStatus = 'planned' | 'available'

export interface ThemeChapterDefinition {
  id: string
  code: string
  title: string
  order: number
  status: ThemeChapterStatus
  experienceId?: string
  scenarioId?: string
}

export interface ThemeTopicDefinition {
  id: string
  number: string
  title: string
  order: number
  chapters: ThemeChapterDefinition[]
}

export interface ThemeSectionDefinition {
  id: string
  number: string
  title: string
  order: number
  topics: ThemeTopicDefinition[]
}

export interface ThemeCatalogDefinition {
  $schema?: string
  themeId: string
  sections: ThemeSectionDefinition[]
}
