import { describe, expect, it } from 'vitest'
import {
  GLOBAL_NOTE_MAX_LENGTH,
  GLOBAL_NOTE_STORAGE_KEY,
  GlobalNoteStorageService,
  countGlobalNoteCharacters,
  limitGlobalNote
} from './GlobalNoteStorageService'

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  const entries = new Map<string, string>()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  }
}

describe('GlobalNoteStorageService', () => {
  it('limits notes to 200 visible characters', () => {
    const source = `${'a'.repeat(199)}🙂extra`
    const limited = limitGlobalNote(source)

    expect(countGlobalNoteCharacters(limited)).toBe(GLOBAL_NOTE_MAX_LENGTH)
    expect(limited.endsWith('🙂')).toBe(true)
  })

  it('persists and reloads one shared note', () => {
    const storage = createMemoryStorage()
    const service = new GlobalNoteStorageService(storage)

    expect(service.save('Hotel booking notes')).toBe('Hotel booking notes')
    expect(storage.getItem(GLOBAL_NOTE_STORAGE_KEY)).toBe('Hotel booking notes')
    expect(new GlobalNoteStorageService(storage).load()).toBe('Hotel booking notes')
  })

  it('clears the persisted note', () => {
    const storage = createMemoryStorage()
    const service = new GlobalNoteStorageService(storage)
    service.save('temporary note')

    service.clear()

    expect(service.load()).toBe('')
    expect(storage.getItem(GLOBAL_NOTE_STORAGE_KEY)).toBeNull()
  })
})
