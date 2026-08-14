<script setup lang="ts">
import { computed } from 'vue'
import type { DialogueLine, StoryCharacter } from '@/scenes/types'

const props = withDefaults(
  defineProps<{
    line: DialogueLine
    character: StoryCharacter | null
    avatarUrl?: string
    continueLabel?: string
  }>(),
  {
    avatarUrl: '',
    continueLabel: '继续'
  }
)

defineEmits<{
  advance: []
}>()

const speakerName = computed(() => props.character?.name ?? 'Narrator')
const speakerInitial = computed(() => speakerName.value.trim().charAt(0).toUpperCase())
</script>

<template>
  <article class="dialogue-box" aria-live="polite">
    <header class="speaker">
      <img
        v-if="avatarUrl"
        class="speaker-avatar"
        :src="avatarUrl"
        :alt="`${speakerName} 的头像`"
      />
      <span v-else class="speaker-avatar speaker-avatar--fallback" aria-hidden="true">
        {{ speakerInitial }}
      </span>
      <p class="speaker-name">{{ speakerName }}</p>
    </header>

    <p class="dialogue-text">{{ line.text }}</p>
    <p v-if="line.translation" class="dialogue-translation">
      {{ line.translation }}
    </p>

    <button class="dialogue-advance" type="button" @click="$emit('advance')">
      {{ continueLabel }}
      <span aria-hidden="true">→</span>
    </button>
  </article>
</template>

<style scoped>
.dialogue-box {
  display: grid;
  gap: 1rem;
  padding: clamp(1.1rem, 4vw, 1.5rem);
  color: #173f3a;
  background: rgb(255 253 248 / 66%);
  border: 1px solid rgb(255 250 242 / 34%);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 20%);
  backdrop-filter: blur(1rem) saturate(120%);
}

.speaker {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.speaker-avatar {
  width: clamp(2.5rem, 10vw, 3rem);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}

.speaker-avatar--fallback {
  display: grid;
  place-items: center;
  color: #fffaf2;
  background: #d86f45;
  font-weight: 800;
}

.speaker-name {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.dialogue-text {
  font-size: clamp(1.3rem, 5vw, 1.75rem);
  font-weight: 700;
  line-height: 1.35;
}

.dialogue-translation {
  color: #6d817d;
  line-height: 1.6;
}

.dialogue-advance {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: fit-content;
  min-height: 2.75rem;
  margin-left: auto;
  padding: 0.65rem 1rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  border-radius: 999px;
  font-weight: 750;
  cursor: pointer;
}

.dialogue-advance:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.2rem;
}

@media (prefers-reduced-motion: no-preference) {
  .dialogue-advance {
    transition: transform 160ms ease;
  }

  .dialogue-advance:hover {
    transform: translateY(-2px);
  }
}
</style>
