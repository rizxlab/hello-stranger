import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  GlobalNoteStorageService,
  limitGlobalNote
} from '@/services/GlobalNoteStorageService'

const storageService = new GlobalNoteStorageService()

export const useGlobalNoteStore = defineStore('global-note', () => {
  const content = ref(storageService.load())

  function setContent(value: string): void {
    content.value = storageService.save(limitGlobalNote(value))
  }

  function clear(): void {
    storageService.clear()
    content.value = ''
  }

  return {
    content,
    setContent,
    clear
  }
})
