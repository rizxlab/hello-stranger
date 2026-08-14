import type {
  ShortSceneDefinition,
  ShortSceneSeriesDefinition
} from './types'

const shortSceneModules = import.meta.glob<ShortSceneDefinition>(
  ['./entries/*.json', './series/*/entries/*.json'],
  {
    eager: true,
    import: 'default'
  }
)

const shortSceneSeriesModules = import.meta.glob<ShortSceneSeriesDefinition>(
  './series/*/series.json',
  {
    eager: true,
    import: 'default'
  }
)

const registry = Object.freeze(
  Object.values(shortSceneModules).reduce<Record<string, ShortSceneDefinition>>(
    (items, shortScene) => {
      if (items[shortScene.id]) {
        throw new Error(`短情景 ID "${shortScene.id}" 重复。`)
      }
      items[shortScene.id] = shortScene
      return items
    },
    {}
  )
)

const seriesRegistry = Object.freeze(
  Object.values(shortSceneSeriesModules).reduce<
    Record<string, ShortSceneSeriesDefinition>
  >((items, series) => {
    if (items[series.id]) {
      throw new Error(`短情景栏目 ID "${series.id}" 重复。`)
    }
    items[series.id] = series
    return items
  }, {})
)

export function listShortScenes(
  seriesId?: string | null
): ShortSceneDefinition[] {
  const shortScenes = Object.values(registry)
  const filtered = seriesId === undefined
    ? shortScenes
    : shortScenes.filter((scene) => (scene.seriesId ?? null) === seriesId)

  return filtered.sort((a, b) => a.order - b.order)
}

export function getShortScene(shortSceneId: string): ShortSceneDefinition | null {
  return registry[shortSceneId] ?? null
}

export function listShortSceneSeries(): ShortSceneSeriesDefinition[] {
  return Object.values(seriesRegistry).sort((a, b) => a.order - b.order)
}

export function getShortSceneSeries(
  seriesId: string
): ShortSceneSeriesDefinition | null {
  return seriesRegistry[seriesId] ?? null
}
