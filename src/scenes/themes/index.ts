import type {
  ThemeCatalogDefinition,
  ThemeCategoryDefinition,
  ThemeSectionDefinition,
  ThemeTopicDefinition
} from './types'

const themeModules = import.meta.glob<ThemeCategoryDefinition>(
  './*/theme.json',
  {
    eager: true,
    import: 'default'
  }
)

const catalogModules = import.meta.glob<ThemeCatalogDefinition>(
  './*/catalog.json',
  {
    eager: true,
    import: 'default'
  }
)

const registry = Object.freeze(
  Object.values(themeModules).reduce<Record<string, ThemeCategoryDefinition>>(
    (items, theme) => {
      if (items[theme.id]) {
        throw new Error(`主题分类 ID "${theme.id}" 重复。`)
      }
      items[theme.id] = theme
      return items
    },
    {}
  )
)

const catalogRegistry = Object.freeze(
  Object.values(catalogModules).reduce<Record<string, ThemeCatalogDefinition>>(
    (items, catalog) => {
      if (items[catalog.themeId]) {
        throw new Error(`主题目录 ID "${catalog.themeId}" 重复。`)
      }
      items[catalog.themeId] = catalog
      return items
    },
    {}
  )
)

export function listThemeCategories(): ThemeCategoryDefinition[] {
  return Object.values(registry).sort((a, b) => {
    const numberOrder = a.catalogNumber.localeCompare(b.catalogNumber)
    return numberOrder || a.order - b.order
  })
}

export function getThemeCategory(
  themeId: string
): ThemeCategoryDefinition | null {
  return registry[themeId] ?? null
}

export function getThemeCatalog(
  themeId: string
): ThemeCatalogDefinition | null {
  return catalogRegistry[themeId] ?? null
}

export function listThemeSections(themeId: string): ThemeSectionDefinition[] {
  return [...(catalogRegistry[themeId]?.sections ?? [])].sort(
    (a, b) => a.order - b.order
  )
}

export function getThemeSection(
  themeId: string,
  sectionId: string
): ThemeSectionDefinition | null {
  return (
    catalogRegistry[themeId]?.sections.find(
      (section) => section.id === sectionId
    ) ?? null
  )
}

export function getThemeTopic(
  themeId: string,
  sectionId: string,
  topicId: string
): ThemeTopicDefinition | null {
  return (
    getThemeSection(themeId, sectionId)?.topics.find(
      (topic) => topic.id === topicId
    ) ?? null
  )
}
