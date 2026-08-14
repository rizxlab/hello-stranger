import type { StoryChapter, StoryDefinition } from './types'

const storyModules = import.meta.glob<StoryDefinition>(
  './stories/*/story.json',
  {
    eager: true,
    import: 'default'
  }
)

const chapterModules = import.meta.glob<StoryChapter>(
  './stories/*/chapters/*.json',
  {
    eager: true,
    import: 'default'
  }
)

function createRegistry<T extends { id: string }>(
  items: readonly T[],
  label: string
): Readonly<Record<string, T>> {
  return Object.freeze(
    items.reduce<Record<string, T>>((registry, item) => {
      if (registry[item.id]) {
        throw new Error(`${label} ID "${item.id}" 重复。`)
      }
      registry[item.id] = item
      return registry
    }, {})
  )
}

export const storyRegistry = createRegistry(
  Object.values(storyModules),
  '故事'
)

export const chapterRegistry = createRegistry(
  Object.values(chapterModules),
  '章节'
)

for (const chapter of Object.values(chapterRegistry)) {
  if (!storyRegistry[chapter.storyId]) {
    throw new Error(
      `章节 "${chapter.id}" 引用了不存在的故事 "${chapter.storyId}"。`
    )
  }
}

export function listStories(): StoryDefinition[] {
  return Object.values(storyRegistry).sort((a, b) => a.order - b.order)
}

export function getStory(storyId: string): StoryDefinition | null {
  return storyRegistry[storyId] ?? null
}

export function listChapters(storyId: string): StoryChapter[] {
  return Object.values(chapterRegistry)
    .filter((chapter) => chapter.storyId === storyId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
}

export function listAllChapters(): StoryChapter[] {
  return Object.values(chapterRegistry)
}

export function getChapter(
  storyId: string,
  chapterId: string
): StoryChapter | null {
  const chapter = chapterRegistry[chapterId]
  return chapter?.storyId === storyId ? chapter : null
}
