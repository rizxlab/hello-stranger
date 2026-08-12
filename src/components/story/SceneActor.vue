<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { SceneActorViewModel } from './sceneTypes'

const props = defineProps<{
  model: SceneActorViewModel
}>()

defineEmits<{
  interact: [actorId: string]
}>()

const actorStyle = computed(() => {
  const placement = props.model.actor.placement
  const portrait = placement.portrait ?? placement.default
  const landscape = placement.landscape ?? placement.default

  return {
    left: `${placement.default.x}%`,
    top: `${placement.default.y}%`,
    '--actor-portrait-x': `${portrait.x}%`,
    '--actor-portrait-y': `${portrait.y}%`,
    '--actor-landscape-x': `${landscape.x}%`,
    '--actor-landscape-y': `${landscape.y}%`
  } as CSSProperties
})
</script>

<template>
  <button
    class="scene-actor"
    :class="{ 'scene-actor--complete': model.completed }"
    :style="actorStyle"
    type="button"
    :disabled="model.completed"
    :aria-label="model.completed
      ? `${model.actor.label}，互动已完成`
      : `与${model.actor.label}对话`"
    @click="$emit('interact', model.actor.id)"
  >
    <span class="actor-portrait">
      <img
        v-if="model.avatarUrl"
        :src="model.avatarUrl"
        :alt="model.character.name"
      />
      <span v-else aria-hidden="true">
        {{ model.character.name.charAt(0).toUpperCase() }}
      </span>
      <span v-if="model.completed" class="actor-check" aria-hidden="true">✓</span>
    </span>
    <span class="actor-label">{{ model.actor.label }}</span>
    <span v-if="!model.completed" class="actor-hint">点击对话</span>
  </button>
</template>

<style scoped>
.scene-actor {
  position: absolute;
  z-index: 2;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  width: clamp(5rem, 24vw, 7rem);
  padding: 0;
  color: #fffaf2;
  background: transparent;
  border: 0;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.actor-portrait {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(4rem, 18vw, 5.5rem);
  aspect-ratio: 1;
  overflow: visible;
  color: #173f3a;
  background: #f4efe6;
  border: 0.22rem solid #fffaf2;
  border-radius: 50%;
  box-shadow:
    0 0 0 0.25rem rgb(216 111 69 / 80%),
    0 0.8rem 1.8rem rgb(15 37 34 / 38%);
  font-size: 1.5rem;
  font-weight: 850;
}

.actor-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.actor-check {
  position: absolute;
  right: -0.2rem;
  bottom: -0.2rem;
  display: grid;
  place-items: center;
  width: 1.55rem;
  aspect-ratio: 1;
  color: #fffaf2;
  background: #173f3a;
  border: 0.12rem solid #fffaf2;
  border-radius: 50%;
  font-size: 0.8rem;
}

.actor-label,
.actor-hint {
  padding: 0.25rem 0.55rem;
  background: rgb(23 63 58 / 88%);
  border-radius: 999px;
  box-shadow: 0 0.35rem 1rem rgb(15 37 34 / 24%);
  backdrop-filter: blur(0.4rem);
}

.actor-label {
  max-width: 100%;
  font-size: 0.74rem;
  font-weight: 850;
  white-space: nowrap;
}

.actor-hint {
  color: rgb(255 250 242 / 76%);
  font-size: 0.62rem;
}

.scene-actor--complete {
  opacity: 0.78;
  cursor: default;
}

.scene-actor:focus-visible {
  outline: 0.2rem solid #f4efe6;
  outline-offset: 0.35rem;
  border-radius: 1rem;
}

@media (orientation: portrait) {
  .scene-actor {
    left: var(--actor-portrait-x) !important;
    top: var(--actor-portrait-y) !important;
  }
}

@media (orientation: landscape) {
  .scene-actor {
    left: var(--actor-landscape-x) !important;
    top: var(--actor-landscape-y) !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .scene-actor:not(:disabled) .actor-portrait {
    animation: actor-pulse 2.2s ease-in-out infinite;
  }

  .scene-actor:not(:disabled):hover .actor-portrait {
    transform: translateY(-0.2rem) scale(1.04);
  }
}

@keyframes actor-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 0.25rem rgb(216 111 69 / 75%),
      0 0.8rem 1.8rem rgb(15 37 34 / 38%);
  }
  50% {
    box-shadow:
      0 0 0 0.48rem rgb(216 111 69 / 30%),
      0 0.8rem 1.8rem rgb(15 37 34 / 38%);
  }
}
</style>
