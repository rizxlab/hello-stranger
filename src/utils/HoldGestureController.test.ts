import { afterEach, describe, expect, it, vi } from 'vitest'
import { HoldGestureController } from './HoldGestureController'

describe('HoldGestureController', () => {
  afterEach(() => vi.useRealTimers())

  it('treats release before the delay as a tap', () => {
    vi.useFakeTimers()
    const activate = vi.fn()
    const gesture = new HoldGestureController(320, activate)

    gesture.press()
    vi.advanceTimersByTime(319)

    expect(gesture.release()).toBe('tap')
    expect(activate).not.toHaveBeenCalled()
  })

  it('activates once and reports a hold after the delay', () => {
    vi.useFakeTimers()
    const activate = vi.fn()
    const gesture = new HoldGestureController(320, activate)

    gesture.press()
    vi.advanceTimersByTime(320)

    expect(activate).toHaveBeenCalledTimes(1)
    expect(gesture.release()).toBe('hold')
  })

  it('does not activate after a cancelled press', () => {
    vi.useFakeTimers()
    const activate = vi.fn()
    const gesture = new HoldGestureController(320, activate)

    gesture.press()
    gesture.cancel()
    vi.runAllTimers()

    expect(activate).not.toHaveBeenCalled()
    expect(gesture.release()).toBeNull()
  })
})
