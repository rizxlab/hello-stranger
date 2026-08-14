<script setup lang="ts">
defineProps<{
  objective: string
  canAdvance: boolean
  nextSceneTitle?: string
}>()

defineEmits<{
  advance: []
}>()
</script>

<template>
  <aside class="scene-objective">
    <span class="objective-icon" aria-hidden="true">◎</span>
    <span class="objective-copy">
      <small>当前目标</small>
      <strong>{{ objective }}</strong>
    </span>
    <button v-if="canAdvance && nextSceneTitle" type="button" @click="$emit('advance')">
      前往{{ nextSceneTitle }} →
    </button>
  </aside>
</template>

<style scoped>
.scene-objective {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  color: #173f3a;
  background: rgb(255 253 248 / 92%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1rem;
  box-shadow: 0 0.7rem 1.8rem rgb(23 63 58 / 12%);
  backdrop-filter: blur(0.7rem);
}

.objective-icon {
  color: #b95431;
  font-size: 1.3rem;
}

.objective-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.objective-copy small {
  color: #6d817d;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.objective-copy strong {
  font-size: 0.82rem;
  line-height: 1.35;
}

button {
  min-height: 2.35rem;
  padding: 0.5rem 0.75rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 28rem) {
  .scene-objective {
    grid-template-columns: auto 1fr;
  }

  button {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
