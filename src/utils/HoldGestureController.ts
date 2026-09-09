export type HoldReleaseResult = 'tap' | 'hold' | null

export class HoldGestureController {
  private timer: ReturnType<typeof setTimeout> | null = null
  private pressed = false
  private activated = false

  constructor(
    private readonly activationDelay: number,
    private readonly onActivate: () => void
  ) {}

  press(): boolean {
    if (this.pressed) return false

    this.pressed = true
    this.activated = false
    this.timer = setTimeout(() => {
      this.timer = null
      if (!this.pressed) return
      this.activated = true
      this.onActivate()
    }, this.activationDelay)
    return true
  }

  release(): HoldReleaseResult {
    if (!this.pressed) return null

    this.pressed = false
    this.clearTimer()
    const result = this.activated ? 'hold' : 'tap'
    this.activated = false
    return result
  }

  cancel(): void {
    this.pressed = false
    this.activated = false
    this.clearTimer()
  }

  private clearTimer(): void {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = null
  }
}
