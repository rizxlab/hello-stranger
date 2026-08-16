import { ref } from 'vue'
import {
  imagePreloadService,
  type ImagePreloadService
} from '@/services/ImagePreloadService'

export interface BackgroundTransitionOptions {
  preloadUrls?: readonly string[]
}

/** 管理背景请求竞态和双层图片切换，不负责选择具体剧情资源。 */
export function useBackgroundTransition(
  preloadService: ImagePreloadService = imagePreloadService,
  transitionDuration = 220
) {
  const displayedUrl = ref('')
  const previousUrl = ref('')
  const isTransitioning = ref(false)
  const loadFailed = ref(false)

  let requestSequence = 0
  let transitionSequence = 0
  let transitionTimer: ReturnType<typeof setTimeout> | null = null

  function clearTransitionTimer(): void {
    if (transitionTimer) {
      clearTimeout(transitionTimer)
      transitionTimer = null
    }
  }

  function preloadNext(urls: readonly string[]): void {
    void preloadService.preload(urls, { priority: 'low', limit: 2 })
  }

  async function show(
    url: string,
    options: BackgroundTransitionOptions = {}
  ): Promise<boolean> {
    const requestId = ++requestSequence
    const preloadUrls = options.preloadUrls ?? []
    loadFailed.value = false

    if (!url) {
      loadFailed.value = true
      return false
    }

    if (displayedUrl.value === url) {
      preloadNext(preloadUrls)
      return true
    }

    try {
      await preloadService.load(url, { priority: 'high' })
    } catch {
      if (requestId === requestSequence) {
        loadFailed.value = true
      }
      return false
    }

    if (requestId !== requestSequence) {
      return false
    }

    clearTransitionTimer()
    previousUrl.value = displayedUrl.value
    displayedUrl.value = url
    isTransitioning.value = true
    const currentTransition = ++transitionSequence

    transitionTimer = setTimeout(() => {
      if (currentTransition !== transitionSequence) return
      previousUrl.value = ''
      isTransitioning.value = false
      transitionTimer = null
    }, transitionDuration)

    preloadNext(preloadUrls)
    return true
  }

  function dispose(): void {
    requestSequence += 1
    transitionSequence += 1
    clearTransitionTimer()
  }

  return {
    displayedUrl,
    previousUrl,
    isTransitioning,
    loadFailed,
    show,
    dispose
  }
}
