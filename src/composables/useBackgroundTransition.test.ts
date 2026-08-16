import { describe, expect, it, vi } from 'vitest'
import { useBackgroundTransition } from './useBackgroundTransition'
import {
  ImagePreloadService,
  type ImageLoadPriority,
  type PendingImageRequest
} from '@/services/ImagePreloadService'

function deferred() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function controlledService() {
  const requests = new Map<string, ReturnType<typeof deferred>>()
  const factory = vi.fn<
    (url: string, priority: ImageLoadPriority) => PendingImageRequest
  >((url) => {
    const request = deferred()
    requests.set(url, request)
    return { promise: request.promise, promote: vi.fn() }
  })

  return {
    requests,
    factory,
    service: new ImagePreloadService(factory)
  }
}

describe('useBackgroundTransition', () => {
  it('keeps the newest image when requests finish out of order', async () => {
    const controlled = controlledService()
    const transition = useBackgroundTransition(controlled.service)

    const slowResult = transition.show('/slow.jpg')
    const fastResult = transition.show('/fast.jpg')

    controlled.requests.get('/fast.jpg')?.resolve()
    expect(await fastResult).toBe(true)
    expect(transition.displayedUrl.value).toBe('/fast.jpg')

    controlled.requests.get('/slow.jpg')?.resolve()
    expect(await slowResult).toBe(false)
    expect(transition.displayedUrl.value).toBe('/fast.jpg')

    transition.dispose()
  })

  it('starts at most two successor preloads after the current image is ready', async () => {
    const controlled = controlledService()
    const transition = useBackgroundTransition(controlled.service)

    const result = transition.show('/current.jpg', {
      preloadUrls: ['/next-1.jpg', '/next-2.jpg', '/next-3.jpg']
    })

    expect(controlled.factory).toHaveBeenCalledTimes(1)
    controlled.requests.get('/current.jpg')?.resolve()
    expect(await result).toBe(true)

    expect(controlled.requests.has('/next-1.jpg')).toBe(true)
    expect(controlled.requests.has('/next-2.jpg')).toBe(true)
    expect(controlled.requests.has('/next-3.jpg')).toBe(false)

    controlled.requests.get('/next-1.jpg')?.resolve()
    controlled.requests.get('/next-2.jpg')?.resolve()
    transition.dispose()
  })

  it('keeps the displayed image when the replacement fails', async () => {
    const controlled = controlledService()
    const transition = useBackgroundTransition(controlled.service)

    const initialResult = transition.show('/current.jpg')
    controlled.requests.get('/current.jpg')?.resolve()
    expect(await initialResult).toBe(true)

    const failedResult = transition.show('/broken.jpg')
    controlled.requests.get('/broken.jpg')?.reject(new Error('network error'))

    expect(await failedResult).toBe(false)
    expect(transition.displayedUrl.value).toBe('/current.jpg')
    expect(transition.loadFailed.value).toBe(true)

    transition.dispose()
  })
})
