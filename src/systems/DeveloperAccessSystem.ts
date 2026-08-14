/** 管理仅在当前内存会话有效的开发者入口，不写入本地存储。 */
class DeveloperAccessSystem {
  private unlocked = false

  get isUnlocked(): boolean {
    return this.unlocked
  }

  unlock(): void {
    this.unlocked = true
  }

  lock(): void {
    this.unlocked = false
  }
}

export const developerAccess = new DeveloperAccessSystem()
