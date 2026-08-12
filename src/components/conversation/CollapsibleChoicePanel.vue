<script setup lang="ts">
import { ref, useId } from 'vue'
import ChoicePanel from '@/components/story/ChoicePanel.vue'

defineProps<{
  prompt: string
  choices: readonly { id: string; text: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  select: [choiceId: string]
  'update:modelValue': [value: string]
}>()

const expanded = ref(false)
const componentId = useId()
const noteId = `answer-note-${componentId}`
const optionsId = `conversation-choice-options-${componentId}`
</script>

<template>
  <section class="collapsible-choices" :class="{ 'collapsible-choices--expanded': expanded }">
    <div class="answer-note">
      <label :for="noteId">我的回答 <span>可选</span></label>
      <textarea
        :id="noteId"
        :value="modelValue"
        rows="2"
        maxlength="500"
        placeholder="先写下你会怎么说……"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <small>这里不会自动校对，展开选项后可以自行对照。</small>
    </div>

    <button
      class="choice-prompt"
      type="button"
      :aria-expanded="expanded"
      :aria-controls="optionsId"
      @click="expanded = !expanded"
    >
      <span class="prompt-copy">{{ prompt }}</span>
      <span class="prompt-action">
        {{ expanded ? '收起选项' : '查看选项' }}
        <span class="prompt-arrow" :class="{ 'prompt-arrow--up': expanded }" aria-hidden="true">↓</span>
      </span>
    </button>

    <div v-if="expanded" :id="optionsId" class="choice-options">
      <ChoicePanel :choices="choices" @select="emit('select', $event)" />
    </div>
  </section>
</template>

<style scoped>
.collapsible-choices {
  display: grid;
  overflow: hidden;
  color: #173f3a;
  background: rgb(255 253 248 / 82%);
  border: 1px solid rgb(255 250 242 / 42%);
  border-radius: 1.2rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 22%);
  backdrop-filter: blur(1rem) saturate(115%);
}

.answer-note {
  display: grid;
  gap: 0.4rem;
  padding: clamp(0.9rem, 3vw, 1.1rem);
  border-bottom: 1px solid rgb(23 63 58 / 10%);
}

.answer-note label {
  font-size: 0.78rem;
  font-weight: 850;
}

.answer-note label span {
  margin-left: 0.3rem;
  color: #6d817d;
  font-size: 0.62rem;
  font-weight: 750;
}

.answer-note textarea {
  width: 100%;
  min-height: 3.8rem;
  max-height: 8rem;
  padding: 0.7rem 0.8rem;
  resize: vertical;
  color: #173f3a;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(23 63 58 / 18%);
  border-radius: 0.8rem;
  font: inherit;
  line-height: 1.5;
}

.answer-note textarea::placeholder {
  color: rgb(69 103 98 / 64%);
}

.answer-note textarea:focus-visible {
  border-color: #d86f45;
  outline: 0.16rem solid rgb(216 111 69 / 24%);
}

.answer-note small {
  color: #6d817d;
  font-size: 0.6rem;
  line-height: 1.45;
}

.choice-prompt {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: clamp(1rem, 4vw, 1.35rem);
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.prompt-copy {
  font-size: clamp(1.05rem, 4.2vw, 1.45rem);
  font-weight: 850;
  line-height: 1.4;
}

.prompt-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #b95431;
  font-size: 0.72rem;
  font-weight: 850;
  white-space: nowrap;
}

.prompt-arrow {
  display: inline-block;
  transition: transform 160ms ease;
}

.prompt-arrow--up {
  transform: rotate(180deg);
}

.choice-options {
  padding: 0.9rem 1rem 1rem;
  border-top: 1px solid rgb(23 63 58 / 10%);
}

.choice-prompt:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: -0.2rem;
}

@media (max-width: 28rem) {
  .choice-prompt {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .prompt-action {
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prompt-arrow {
    transition: none;
  }
}
</style>
