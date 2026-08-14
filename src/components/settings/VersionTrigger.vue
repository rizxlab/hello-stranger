<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

defineProps<{
  version: string
}>()

const emit = defineEmits<{
  unlock: []
}>()

const clickCount = ref(0)
let resetTimer: ReturnType<typeof setTimeout> | null = null

function resetSequence(): void {
  clickCount.value = 0
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
}

function registerClick(): void {
  clickCount.value += 1

  if (clickCount.value >= 3) {
    resetSequence()
    emit('unlock')
    return
  }

  if (resetTimer) {
    clearTimeout(resetTimer)
  }
  resetTimer = setTimeout(resetSequence, 1500)
}

onBeforeUnmount(resetSequence)
</script>

<template>
  <button
    type="button"
    class="version-trigger"
    :aria-label="`当前版本 ${version}`"
    @click="registerClick"
  >
    Version {{ version }}
  </button>
</template>

<style scoped>
.version-trigger {
  padding: 0.5rem;
  color: rgb(69 103 98 / 68%);
  background: transparent;
  border: 0;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  cursor: default;
}

.version-trigger:focus-visible {
  outline: 0.15rem solid #d86f45;
  outline-offset: 0.15rem;
  border-radius: 0.5rem;
}
</style>
