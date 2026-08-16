import { describe, expect, it, vi } from 'vitest'
import {
  ImagePreloadService,
  type ImageLoadPriority,
  type PendingImageRequest
} from './ImagePreloadService'

function deferred() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('ImagePreloadService', () => {
  it('merges concurrent requests for the same URL and promotes priority', async () => {
    const request = deferred()
    const promote = vi.fn<(priority: ImageLoadPriority) => void>()
    const factory = vi.fn<
      (url: string, priority: ImageLoadPriority) => PendingImageRequest
    >(() => ({ promise: request.promise, promote }))
    const service = new ImagePreloadService(factory)

    const first = service.load('/scene.jpg', { priority: 'low' })
    const second = service.load('/scene.jpg', { priority: 'high' })

    expect(first).toBe(second)
    expect(factory).toHaveBeenCalledTimes(1)
    expect(promote).toHaveBeenCalledWith('high')

    request.resolve()
    await first

    expect(service.isLoaded('/scene.jpg')).toBe(true)
  })
})
