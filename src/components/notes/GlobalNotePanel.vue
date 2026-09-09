<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import VoiceAnswerInput from '@/components/conversation/VoiceAnswerInput.vue'
import { countGlobalNoteCharacters } from '@/services/GlobalNoteStorageService'

const props = defineProps<{
  modelValue: string
  maxLength: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const panel = ref<HTMLElement | null>(null)
const characterCount = computed(() =>
  countGlobalNoteCharacters(props.modelValue)
)

async function openNote(): Promise<void> {
  isOpen.value = true
  await nextTick()
  panel.value?.focus({ preventScroll: true })
}

function closeNote(): void {
  isOpen.value = false
}

</script>

<template>
  <Teleport to="body">
    <button
      v-if="!isOpen"
      class="note-launcher"
      type="button"
      aria-label="打开笔记"
      aria-haspopup="dialog"
      @click="openNote"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 3.5h10a2 2 0 0 1 2 2v15h-12a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"></path>
        <path d="M8 3.5v17M11 8h4.5M11 12h4.5"></path>
      </svg>
      <span>笔记</span>
    </button>

    <div
      v-if="isOpen"
      class="note-backdrop"
      @pointerdown.self="closeNote"
    >
      <aside
        ref="panel"
        class="note-panel scrollbar-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-note-title"
        tabindex="-1"
        @keydown.esc.stop="closeNote"
      >
        <header class="note-header">
          <div>
            <span>Quick notes</span>
            <strong id="global-note-title">笔记</strong>
          </div>
          <button type="button" aria-label="收起笔记" @click="closeNote">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17"></path>
            </svg>
          </button>
        </header>

        <section class="note-content">
          <div class="note-label">
            <label for="global-note-content">笔记内容</label>
            <span>{{ characterCount }} / {{ maxLength }}</span>
          </div>
          <VoiceAnswerInput
            id="global-note-content"
            :model-value="modelValue"
            :max-length="maxLength"
            @update:model-value="emit('update:modelValue', $event)"
          />
        </section>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.note-launcher {
  position: fixed;
  z-index: 80;
  top: 54%;
  right: max(0px, env(safe-area-inset-right));
  display: grid;
  justify-items: center;
  gap: 0.22rem;
  min-width: 3.25rem;
  padding: 0.72rem 0.55rem 0.68rem;
  color: #fffaf2;
  background: rgb(23 63 58 / 88%);
  border: 1px solid rgb(255 250 242 / 24%);
  border-right: 0;
  border-radius: 1rem 0 0 1rem;
  box-shadow: 0 0.8rem 2rem rgb(15 37 34 / 28%);
  backdrop-filter: blur(0.8rem) saturate(120%);
  transform: translateY(-50%);
  cursor: pointer;
}

.note-launcher svg {
  width: 1.25rem;
  height: 1.25rem;
}

.note-launcher span {
  font-size: 0.55rem;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.note-backdrop {
  position: fixed;
  z-index: 79;
  inset: 0;
  background: rgb(15 37 34 / 22%);
  backdrop-filter: blur(0.12rem);
}

.note-panel {
  position: absolute;
  top: 50%;
  right: max(0.75rem, env(safe-area-inset-right));
  display: grid;
  gap: 1rem;
  width: min(calc(100% - 1.5rem), 23rem);
  max-height: min(72dvh, 34rem);
  padding: 1rem;
  overflow-y: auto;
  color: #173f3a;
  background: rgb(248 243 234 / 94%);
  border: 1px solid rgb(255 250 242 / 62%);
  border-radius: 1.25rem;
  box-shadow: 0 1.5rem 4rem rgb(15 37 34 / 36%);
  backdrop-filter: blur(1.2rem) saturate(115%);
  transform: translateY(-50%);
  overscroll-behavior: contain;
}

.note-panel:focus {
  outline: none;
}

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.note-header > div {
  display: grid;
  gap: 0.15rem;
}

.note-header span {
  color: #b95431;
  font-size: 0.57rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.note-header strong {
  font-size: 1.15rem;
}

.note-header button {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  color: #173f3a;
  background: rgb(23 63 58 / 8%);
  border: 0;
  border-radius: 50%;
  place-items: center;
  cursor: pointer;
}

.note-header button svg {
  width: 1rem;
  height: 1rem;
}

.note-launcher svg,
.note-header button svg {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.note-content {
  display: grid;
  gap: 0.45rem;
}

.note-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.note-label label {
  font-size: 0.78rem;
  font-weight: 850;
}

.note-label span {
  color: #6d817d;
  font-size: 0.62rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.note-launcher:focus-visible,
.note-header button:focus-visible {
  outline: 0.18rem solid #f0a181;
  outline-offset: 0.12rem;
}

@media (max-width: 30rem) {
  .note-panel {
    width: min(calc(100% - 1.25rem), 22rem);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .note-launcher {
    transition: background 160ms ease, transform 160ms ease;
  }

  .note-launcher:hover {
    background: rgb(23 63 58 / 96%);
    transform: translateY(-50%) translateX(-0.15rem);
  }
}
</style>
