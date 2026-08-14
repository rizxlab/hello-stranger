<script setup lang="ts">
import type { StoryScene } from '@/scenes/types'
import SceneActor from './SceneActor.vue'
import SceneObjective from './SceneObjective.vue'
import type { SceneActorViewModel } from './sceneTypes'

defineProps<{
  scene: StoryScene
  backgroundUrl: string
  portraitBackgroundUrl?: string
  actors: readonly SceneActorViewModel[]
  canAdvance: boolean
  nextSceneTitle?: string
}>()

defineEmits<{
  interact: [actorId: string]
  advance: []
}>()
</script>

<template>
  <section class="scene-stage" :aria-label="scene.title">
    <picture class="scene-background">
      <source
        v-if="portraitBackgroundUrl"
        media="(orientation: portrait)"
        :srcset="portraitBackgroundUrl"
      />
      <img class="scene-background-image" :src="backgroundUrl" :alt="scene.title" />
    </picture>
    <div class="scene-shade" aria-hidden="true"></div>

    <SceneActor
      v-for="actor in actors"
      :key="actor.actor.id"
      :model="actor"
      @interact="$emit('interact', $event)"
    />

    <div class="scene-title">{{ scene.title }}</div>

    <slot name="hud"></slot>

    <div class="objective-wrap">
      <SceneObjective
        :objective="scene.objective"
        :can-advance="canAdvance"
        :next-scene-title="nextSceneTitle"
        @advance="$emit('advance')"
      />
    </div>
  </section>
</template>

<style scoped>
.scene-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  background: #173f3a;
  isolation: isolate;
}

.scene-background,
.scene-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.scene-background-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-shade {
  z-index: 1;
  background:
    linear-gradient(to bottom, rgb(15 37 34 / 18%), transparent 28%),
    linear-gradient(to top, rgb(15 37 34 / 24%), transparent 30%);
  pointer-events: none;
}

.scene-title {
  position: absolute;
  z-index: 2;
  top: calc(max(0.75rem, env(safe-area-inset-top)) + 3.8rem);
  left: max(0.75rem, env(safe-area-inset-left));
  padding: 0.38rem 0.65rem;
  color: #fffaf2;
  background: rgb(23 63 58 / 78%);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 850;
  backdrop-filter: blur(0.5rem);
}

.objective-wrap {
  position: absolute;
  z-index: 3;
  right: max(0.75rem, env(safe-area-inset-right));
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  left: max(0.75rem, env(safe-area-inset-left));
  margin-inline: auto;
  max-width: 46rem;
}
</style>
