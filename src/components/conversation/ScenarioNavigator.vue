<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ConversationScenarioDefinition } from '@/scenes/conversations/types'

defineProps<{
  scenarios: readonly ConversationScenarioDefinition[]
  currentScenarioId?: string
}>()

const emit = defineEmits<{
  select: [scenarioId: string]
}>()

const open = ref(false)
const navigator = ref<HTMLElement | null>(null)

function closeWhenClickingOutside(event: PointerEvent): void {
  if (open.value && !navigator.value?.contains(event.target as Node)) {
    open.value = false
  }
}

function closeWithEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeWhenClickingOutside)
  document.addEventListener('keydown', closeWithEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeWhenClickingOutside)
  document.removeEventListener('keydown', closeWithEscape)
})

function selectScenario(scenarioId: string): void {
  open.value = false
  emit('select', scenarioId)
}
</script>

<template>
  <div ref="navigator" class="navigator">
    <button
      class="navigator-trigger"
      type="button"
      :aria-expanded="open"
      aria-label="选择子情景"
      @click="open = !open"
    >
      情景目录
    </button>
    <div v-if="open" class="navigator-menu">
      <p>选择子情景</p>
      <button
        v-for="(scenario, index) in scenarios"
        :key="scenario.id"
        type="button"
        :class="{ active: scenario.id === currentScenarioId }"
        @click="selectScenario(scenario.id)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <strong>{{ scenario.title }}</strong>
      </button>
    </div>
  </div>
</template>

<style scoped>
.navigator {
  position: relative;
  z-index: 1;
}

.navigator-trigger {
  padding: 0.62rem 0.8rem;
  color: #fffaf2;
  background: rgb(23 63 58 / 66%);
  border: 1px solid rgb(255 250 242 / 20%);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  backdrop-filter: blur(0.7rem);
  cursor: pointer;
}

.navigator-menu {
  position: absolute;
  z-index: 1;
  top: calc(100% + 0.45rem);
  right: 0;
  display: grid;
  gap: 0.4rem;
  width: min(20rem, calc(100vw - 1.5rem));
  padding: 0.8rem;
  color: #173f3a;
  background: rgb(255 253 248 / 94%);
  border: 1px solid rgb(255 250 242 / 44%);
  border-radius: 1rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 24%);
  backdrop-filter: blur(1rem);
}

.navigator-menu > p {
  padding: 0.2rem 0.35rem 0.4rem;
  color: #6d817d;
  font-size: 0.68rem;
  font-weight: 800;
}

.navigator-menu > button {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem;
  color: #173f3a;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0.7rem;
  cursor: pointer;
}

.navigator-menu > button.active {
  background: rgb(216 111 69 / 13%);
}

.navigator-menu span {
  color: #b95431;
  font-size: 0.68rem;
  font-weight: 850;
}

.navigator-menu strong {
  font-size: 0.72rem;
  line-height: 1.35;
}
</style>
