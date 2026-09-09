export const GLOBAL_NOTE_STORAGE_KEY = 'hello-stranger.global-note.v1'
export const GLOBAL_NOTE_MAX_LENGTH = 200

type NoteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function limitGlobalNote(
  value: string,
  maxLength = GLOBAL_NOTE_MAX_LENGTH
): string {
  return Array.from(value).slice(0, maxLength).join('')
}

export function countGlobalNoteCharacters(value: string): number {
  return Array.from(value).length
}

export class GlobalNoteStorageService {
  constructor(private readonly storage?: NoteStorage) {}

  load(): string {
    try {
      return limitGlobalNote(this.getStorage()?.getItem(GLOBAL_NOTE_STORAGE_KEY) ?? '')
    } catch {
      return ''
    }
  }

  save(value: string): string {
    const limitedValue = limitGlobalNote(value)
    try {
      if (limitedValue) {
        this.getStorage()?.setItem(GLOBAL_NOTE_STORAGE_KEY, limitedValue)
      } else {
        this.getStorage()?.removeItem(GLOBAL_NOTE_STORAGE_KEY)
      }
    } catch {
      // 隐私模式或存储空间不可用时，Store 仍可保留本次会话内容。
    }
    return limitedValue
  }

  clear(): void {
    try {
      this.getStorage()?.removeItem(GLOBAL_NOTE_STORAGE_KEY)
    } catch {
      // 清理失败不应阻断玩家数据重置。
    }
  }

  private getStorage(): NoteStorage | undefined {
    if (this.storage) return this.storage
    return typeof window === 'undefined' ? undefined : window.localStorage
  }
}
