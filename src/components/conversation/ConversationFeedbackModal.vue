<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import FeedbackPanel from '@/components/story/FeedbackPanel.vue'
import type { ChoiceFeedback } from '@/scenes/types'

defineProps<{
  expression: string
  feedback: ChoiceFeedback
}>()

defineEmits<{
  continue: []
  back: []
}>()

const dialog = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()
  dialog.value?.querySelector<HTMLButtonElement>('.feedback-continue')?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="feedback-backdrop">
      <section
        ref="dialog"
        class="feedback-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="英语表达反馈"
        tabindex="-1"
      >
        <FeedbackPanel
          :expression="expression"
          :feedback="feedback"
          continue-label="继续会话"
          back-label="返回选项"
          @back="$emit('back')"
          @continue="$emit('continue')"
        />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.feedback-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  background: rgb(15 37 34 / 52%);
  backdrop-filter: blur(0.35rem);
}

.feedback-dialog {
  width: min(100%, 40rem);
  max-height: min(82vh, 42rem);
  overflow-y: auto;
  border-radius: 1.25rem;
  box-shadow: 0 1.5rem 4rem rgb(15 37 34 / 34%);
  overscroll-behavior: contain;
}

.feedback-dialog:focus {
  outline: none;
}
</style>
