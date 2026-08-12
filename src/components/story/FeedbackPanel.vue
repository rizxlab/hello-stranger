<script setup lang="ts">
import type { ChoiceFeedback } from '@/scenes/types'

withDefaults(
  defineProps<{
    expression: string
    feedback: ChoiceFeedback
    continueLabel?: string
    backLabel?: string
  }>(),
  {
    continueLabel: '继续剧情'
  }
)

defineEmits<{
  continue: []
  back: []
}>()
</script>

<template>
  <article class="feedback-panel" aria-live="polite">
    <div class="feedback-section">
      <p class="feedback-label">你的表达</p>
      <p class="feedback-expression">“{{ expression }}”</p>
    </div>

    <div class="feedback-section">
      <p class="feedback-label">自然程度</p>
      <div
        class="naturalness-stars"
        role="img"
        :aria-label="`自然程度 ${feedback.naturalness} 星，共 5 星`"
      >
        <span
          v-for="star in 5"
          :key="star"
          :class="{ 'star--active': star <= feedback.naturalness }"
          aria-hidden="true"
        >★</span>
      </div>
      <p class="feedback-assessment">{{ feedback.assessment }}</p>
    </div>

    <div v-if="feedback.naturalExpression" class="feedback-section natural-expression">
      <p class="feedback-label">更自然的表达</p>
      <p class="feedback-expression">“{{ feedback.naturalExpression }}”</p>
    </div>

    <div class="feedback-section">
      <p class="feedback-label">为什么？</p>
      <p class="feedback-explanation">{{ feedback.explanation }}</p>
    </div>

    <div class="feedback-actions">
      <button
        v-if="backLabel"
        class="feedback-back"
        type="button"
        @click="$emit('back')"
      >
        <span aria-hidden="true">←</span>
        {{ backLabel }}
      </button>
      <button class="feedback-continue" type="button" @click="$emit('continue')">
        {{ continueLabel }}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.feedback-panel {
  display: grid;
  gap: 1.1rem;
  padding: clamp(1.1rem, 4vw, 1.5rem);
  color: #173f3a;
  max-height: min(78vh, 42rem);
  overflow-y: auto;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(255 250 242 / 34%);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 20%);
  backdrop-filter: blur(1rem) saturate(120%);
}

.feedback-section {
  display: grid;
  gap: 0.4rem;
}

.feedback-label {
  color: #6d817d;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.feedback-expression {
  font-size: clamp(1.1rem, 4vw, 1.35rem);
  font-weight: 750;
  line-height: 1.45;
}

.naturalness-stars {
  display: flex;
  gap: 0.18rem;
  color: rgb(23 63 58 / 18%);
  font-size: 1.35rem;
  line-height: 1;
}

.star--active {
  color: #d86f45;
}

.feedback-assessment,
.feedback-explanation {
  color: #456762;
  line-height: 1.65;
}

.natural-expression {
  padding: 0.9rem 1rem;
  background: rgb(216 111 69 / 12%);
  border-radius: 0.9rem;
}

.feedback-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.feedback-back,
.feedback-continue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: fit-content;
  min-height: 2.75rem;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  font-weight: 750;
  cursor: pointer;
}

.feedback-back {
  color: #173f3a;
  background: transparent;
  border: 1px solid rgb(23 63 58 / 24%);
}

.feedback-continue {
  color: #fffaf2;
  background: #173f3a;
  border: 0;
}

.feedback-back:focus-visible,
.feedback-continue:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.2rem;
}

@media (prefers-reduced-motion: no-preference) {
  .feedback-back,
  .feedback-continue {
    transition: transform 160ms ease;
  }

  .feedback-back:hover,
  .feedback-continue:hover {
    transform: translateY(-2px);
  }
}
</style>
