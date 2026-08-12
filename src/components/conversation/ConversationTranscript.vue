<script setup lang="ts">
import { computed } from 'vue'
import type {
  ConversationParticipant,
  ConversationScenarioDefinition
} from '@/scenes/conversations/types'
import type { ConversationTranscriptEntry } from '@/systems/ConversationSequenceSystem'

const props = defineProps<{
  scenario: ConversationScenarioDefinition
  entries: readonly ConversationTranscriptEntry[]
}>()

const participants = computed(() =>
  props.scenario.participants.reduce<Record<string, ConversationParticipant>>(
    (result, participant) => {
      result[participant.id] = participant
      return result
    },
    {}
  )
)
</script>

<template>
  <div class="transcript" aria-live="polite">
    <article
      v-for="entry in entries"
      :key="entry.turnId"
      class="bubble-row"
      :class="{ 'bubble-row--player': participants[entry.speakerId]?.role === 'player' }"
    >
      <p class="speaker">{{ participants[entry.speakerId]?.name ?? entry.speakerId }}</p>
      <div class="bubble">
        <p class="english">{{ entry.text }}</p>
        <p
          v-if="entry.translation && participants[entry.speakerId]?.role !== 'partner'"
          class="translation"
        >{{ entry.translation }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.transcript {
  display: grid;
  gap: 0.8rem;
}

.bubble-row {
  display: grid;
  justify-items: start;
  gap: 0.25rem;
}

.bubble-row--player {
  justify-items: end;
}

.speaker {
  padding-inline: 0.35rem;
  color: rgb(255 250 242 / 72%);
  font-size: 0.65rem;
  font-weight: 800;
}

.bubble {
  width: fit-content;
  max-width: min(88%, 32rem);
  padding: 0.75rem 0.9rem;
  color: #173f3a;
  background: rgb(255 253 248 / 82%);
  border: 1px solid rgb(255 250 242 / 34%);
  border-radius: 0.35rem 1rem 1rem;
  box-shadow: 0 0.55rem 1.4rem rgb(15 37 34 / 12%);
  backdrop-filter: blur(0.8rem);
}

.bubble-row--player .bubble {
  color: #fffaf2;
  background: rgb(23 63 58 / 86%);
  border-radius: 1rem 0.35rem 1rem 1rem;
}

.english {
  font-weight: 700;
  line-height: 1.5;
}

.translation {
  margin-top: 0.3rem;
  color: #6d817d;
  font-size: 0.72rem;
  line-height: 1.5;
}

.bubble-row--player .translation {
  color: rgb(255 250 242 / 68%);
}
</style>
