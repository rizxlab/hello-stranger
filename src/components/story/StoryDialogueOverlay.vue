<script setup lang="ts">
import type {
  DialogueLine,
  StoryCharacter,
  StoryChoice
} from '@/scenes/types'
import type { ChoiceResult } from '@/systems/ChoiceSystem'
import ChoicePanel from './ChoicePanel.vue'
import DialogueBox from './DialogueBox.vue'
import FeedbackPanel from './FeedbackPanel.vue'

defineProps<{
  phase: 'dialogue' | 'choices' | 'feedback'
  line: DialogueLine | null
  character: StoryCharacter | null
  avatarUrl: string
  choices: readonly StoryChoice[]
  result: ChoiceResult | null
  canClose: boolean
}>()

defineEmits<{
  advanceDialogue: []
  selectChoice: [choiceId: string]
  continueFeedback: []
  close: []
}>()
</script>

<template>
  <div class="dialogue-overlay">
    <button v-if="canClose" class="overlay-close" type="button" aria-label="返回场景" @click="$emit('close')">
      ×
    </button>

    <DialogueBox
      v-if="phase === 'dialogue' && line"
      :line="line"
      :character="character"
      :avatar-url="avatarUrl"
      @advance="$emit('advanceDialogue')"
    />

    <div v-else-if="phase === 'choices'" class="choice-wrap">
      <ChoicePanel :choices="choices" @select="$emit('selectChoice', $event)" />
    </div>

    <FeedbackPanel
      v-else-if="phase === 'feedback' && result"
      :expression="result.expression"
      :feedback="result.feedback"
      @continue="$emit('continueFeedback')"
    />
  </div>
</template>

<style scoped>
.dialogue-overlay {
  position: absolute;
  z-index: 5;
  inset: 0;
  display: grid;
  align-content: end;
  padding: 6.5rem max(0.75rem, env(safe-area-inset-right)) max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
  background: linear-gradient(to top, rgb(15 37 34 / 42%), transparent 58%);
  pointer-events: none;
}

.dialogue-overlay > * {
  width: min(100%, 46rem);
  margin-inline: auto;
  pointer-events: auto;
}

.overlay-close {
  position: absolute;
  top: calc(max(0.75rem, env(safe-area-inset-top)) + 4rem);
  right: max(0.75rem, env(safe-area-inset-right));
  display: grid;
  place-items: center;
  width: 2.4rem;
  aspect-ratio: 1;
  color: #fffaf2;
  width: 2.25rem;
  background: rgb(23 63 58 / 52%);
  border: 1px solid rgb(255 250 242 / 28%);
  border-radius: 50%;
  font-size: 1.35rem;
  cursor: pointer;
}

.choice-wrap {
  max-height: min(72vh, 38rem);
  overflow-y: auto;
  padding: 0.9rem;
  background: rgb(244 239 230 / 62%);
  border: 1px solid rgb(255 250 242 / 30%);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 22%);
  backdrop-filter: blur(1rem) saturate(115%);
}
</style>
