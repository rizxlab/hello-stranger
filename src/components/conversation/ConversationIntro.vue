<script setup lang="ts">
defineProps<{
  scenarioNumber: number
  title: string
  setting: string
  compact: boolean
}>()

defineEmits<{
  start: []
}>()
</script>

<template>
  <article class="intro-card" :class="{ 'intro-card--compact': compact }">
    <p class="intro-label">情景介绍 · {{ String(scenarioNumber).padStart(2, '0') }}</p>
    <h2 v-if="!compact">{{ title }}</h2>
    <div class="setting">
      <span aria-hidden="true">◎</span>
      <p>{{ setting }}</p>
    </div>
    <button v-if="!compact" type="button" @click="$emit('start')">开始会话 <span aria-hidden="true">→</span></button>
  </article>
</template>

<style scoped>
.intro-card {
  display: grid;
  gap: 1rem;
  padding: clamp(1.2rem, 5vw, 1.8rem);
  color: #173f3a;
  background: rgb(255 253 248 / 78%);
  border: 1px solid rgb(255 250 242 / 40%);
  border-radius: 1.4rem;
  box-shadow: 0 1rem 2.8rem rgb(15 37 34 / 24%);
  backdrop-filter: blur(1rem) saturate(120%);
}

.intro-card--compact {
  gap: 0.35rem;
  padding: 0.65rem 0.85rem;
  border-radius: 0.9rem;
}

.intro-card--compact .setting {
  gap: 0.5rem;
  padding: 0;
  background: transparent;
  font-size: 0.72rem;
  line-height: 1.5;
}

.intro-label {
  color: #b95431;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-card--compact .intro-label {
  font-size: 0.58rem;
}

h2 {
  margin: 0;
  font-size: clamp(1.45rem, 6vw, 2.2rem);
  line-height: 1.15;
}

.setting {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.7rem;
  padding: 1rem;
  color: #456762;
  background: rgb(23 63 58 / 8%);
  border-radius: 1rem;
  line-height: 1.7;
}

.setting > span {
  color: #b95431;
  font-weight: 900;
}

button {
  justify-self: end;
  padding: 0.75rem 1.05rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
}
</style>
