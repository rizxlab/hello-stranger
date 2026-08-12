<script setup lang="ts">
withDefaults(
  defineProps<{
    choices: readonly { id: string; text: string }[]
    selectedChoiceId?: string | null
    disabled?: boolean
  }>(),
  {
    selectedChoiceId: null,
    disabled: false
  }
)

defineEmits<{
  select: [choiceId: string]
}>()
</script>

<template>
  <fieldset class="choice-panel" :disabled="disabled">
    <legend class="choice-heading">你会怎么说？</legend>

    <button
      v-for="(choice, index) in choices"
      :key="choice.id"
      class="choice-button"
      :class="{ 'choice-button--selected': selectedChoiceId === choice.id }"
      type="button"
      :aria-pressed="selectedChoiceId === choice.id"
      @click="$emit('select', choice.id)"
    >
      <span class="choice-index" aria-hidden="true">{{ index + 1 }}</span>
      <span>{{ choice.text }}</span>
    </button>
  </fieldset>
</template>

<style scoped>
.choice-panel {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.choice-heading {
  margin-bottom: 0.25rem;
  color: #173f3a;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.choice-button {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.8rem 1rem;
  color: #173f3a;
  text-align: left;
  background: rgb(255 253 248 / 68%);
  border: 1px solid rgb(23 63 58 / 16%);
  border-radius: 1rem;
  cursor: pointer;
  backdrop-filter: blur(0.65rem);
}

.choice-index {
  display: grid;
  place-items: center;
  width: 1.8rem;
  aspect-ratio: 1;
  color: #b95431;
  background: rgb(216 111 69 / 14%);
  border-radius: 50%;
  font-size: 0.78rem;
  font-weight: 850;
}

.choice-button--selected {
  color: #fffaf2;
  background: #173f3a;
}

.choice-button--selected .choice-index {
  color: #173f3a;
  background: #f4efe6;
}

.choice-button:disabled {
  cursor: default;
  opacity: 0.68;
}

.choice-button:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.15rem;
}

@media (prefers-reduced-motion: no-preference) {
  .choice-button {
    transition: transform 160ms ease, background-color 160ms ease;
  }

  .choice-button:not(:disabled):hover {
    transform: translateY(-2px);
  }
}
</style>
