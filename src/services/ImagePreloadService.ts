export type ImageLoadPriority = 'high' | 'auto' | 'low'

export interface ImageLoadOptions {
  priority?: ImageLoadPriority
}

export interface ResponsiveImageSource {
  url: string
  portraitUrl?: string
}

export interface PendingImageRequest {
  promise: Promise<void>
  promote(priority: ImageLoadPriority): void
}

export type ImageRequestFactory = (
  url: string,
  priority: ImageLoadPriority
) => PendingImageRequest

interface InflightImageRequest extends PendingImageRequest {
  priority: ImageLoadPriority
}

const priorityRank: Record<ImageLoadPriority, number> = {
  low: 0,
  auto: 1,
  high: 2
}

function createBrowserImageRequest(
  url: string,
  initialPriority: ImageLoadPriority
): PendingImageRequest {
  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = initialPriority

  let settled = false
  let currentPriority = initialPriority

  const promise = new Promise<void>((resolve, reject) => {
    image.addEventListener('load', async () => {
      if (settled) return

      try {
        await image.decode()
        settled = true
        resolve()
      } catch (error) {
        settled = true
        reject(error)
      }
    }, { once: true })

    image.addEventListener('error', () => {
      if (settled) return
      settled = true
      reject(new Error(`图片加载失败：${url}`))
    }, { once: true })

    image.src = url
  })

  return {
    promise,
    promote(priority) {
      if (priorityRank[priority] > priorityRank[currentPriority]) {
        currentPriority = priority
        image.fetchPriority = priority
      }
    }
  }
}

/** 合并相同 URL 的请求，并统一等待图片下载与解码完成。 */
export class ImagePreloadService {
  private readonly loadedUrls = new Set<string>()
  private readonly inflightRequests = new Map<string, InflightImageRequest>()

  constructor(
    private readonly requestFactory: ImageRequestFactory = createBrowserImageRequest
  ) {}

  load(url: string, options: ImageLoadOptions = {}): Promise<void> {
    if (!url || this.loadedUrls.has(url)) {
      return Promise.resolve()
    }

    const priority = options.priority ?? 'auto'
    const existing = this.inflightRequests.get(url)
    if (existing) {
      if (priorityRank[priority] > priorityRank[existing.priority]) {
        existing.priority = priority
        existing.promote(priority)
      }
      return existing.promise
    }

    const request = this.requestFactory(url, priority)
    const trackedRequest: InflightImageRequest = {
      ...request,
      priority,
      promise: request.promise
        .then(() => {
          this.loadedUrls.add(url)
        })
        .finally(() => {
          this.inflightRequests.delete(url)
        })
    }

    this.inflightRequests.set(url, trackedRequest)
    return trackedRequest.promise
  }

  async preload(
    urls: readonly string[],
    options: ImageLoadOptions & { limit?: number } = {}
  ): Promise<void> {
    const uniqueUrls = [...new Set(urls.filter(Boolean))]
      .slice(0, options.limit ?? 2)

    await Promise.allSettled(
      uniqueUrls.map((url) => this.load(url, {
        priority: options.priority ?? 'low'
      }))
    )
  }

  isLoaded(url: string): boolean {
    return this.loadedUrls.has(url)
  }
}

export function isPortraitViewport(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(orientation: portrait)').matches
}

export function selectPreferredImageUrl(
  url: string,
  portraitUrl?: string,
  portrait = isPortraitViewport()
): string {
  return portrait && portraitUrl ? portraitUrl : url
}

export const imagePreloadService = new ImagePreloadService()
