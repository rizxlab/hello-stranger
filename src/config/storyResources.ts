export interface BackgroundResource {
  label: string
  url: string
  portraitUrl?: string
  backgroundImage: string
}

export interface CoverResource {
  backgroundImage: string
}

export interface StoryResourceBundle {
  backgrounds?: Record<string, BackgroundResource>
  avatars?: Record<string, string>
  covers?: Record<string, CoverResource>
}

const resourceModules = import.meta.glob<StoryResourceBundle>(
  [
    '../scenes/stories/*/resources.ts',
    '../scenes/shorts/series/*/resources.ts'
  ],
  {
    eager: true,
    import: 'default'
  }
)

function mergeResources<T>(
  key: keyof StoryResourceBundle,
  label: string
): Record<string, T> {
  const registry: Record<string, T> = {}

  for (const bundle of Object.values(resourceModules)) {
    const entries = (bundle[key] ?? {}) as Record<string, T>
    for (const [resourceKey, resource] of Object.entries(entries)) {
      if (registry[resourceKey]) {
        throw new Error(`${label}资源键 "${resourceKey}" 重复。`)
      }
      registry[resourceKey] = resource
    }
  }

  return registry
}

const defaultBackground: BackgroundResource = {
  label: 'Unknown location',
  url: '',
  backgroundImage:
    'linear-gradient(145deg, rgb(23 63 58 / 92%), rgb(69 103 98 / 82%))'
}

export const storyResources = {
  backgrounds: mergeResources<BackgroundResource>('backgrounds', '背景'),
  avatars: mergeResources<string>('avatars', '头像'),
  covers: mergeResources<CoverResource>('covers', '封面')
}

export function getBackgroundResource(resourceKey: string): BackgroundResource {
  return storyResources.backgrounds[resourceKey] ?? defaultBackground
}

export function getAvatarResource(resourceKey?: string): string {
  return resourceKey ? storyResources.avatars[resourceKey] ?? '' : ''
}

export function getCoverResource(resourceKey?: string): CoverResource {
  if (resourceKey && storyResources.covers[resourceKey]) {
    return storyResources.covers[resourceKey]
  }

  return {
    backgroundImage:
      'radial-gradient(circle at 78% 18%, rgb(216 111 69 / 34%), transparent 28%), linear-gradient(145deg, #456762, #173f3a)'
  }
}
