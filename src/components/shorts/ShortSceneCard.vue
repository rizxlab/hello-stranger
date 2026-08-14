<script setup lang="ts">
import { getBackgroundResource } from '@/config/storyResources'
import type { ShortSceneDefinition } from '@/scenes/shorts/types'

defineProps<{
  shortScene: ShortSceneDefinition
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'play-short', params: { shortId: shortScene.id } }"
    class="short-card"
  >
    <img
      :src="getBackgroundResource(shortScene.cover).url"
      :alt="shortScene.title"
    />
    <span class="short-copy">
      <span class="short-meta">
        {{ shortScene.category }} · {{ shortScene.durationMinutes }} 分钟
      </span>
      <strong>{{ shortScene.title }}</strong>
      <small>{{ shortScene.summary }}</small>
      <span class="short-tags">
        <span>{{ shortScene.level }}</span>
        <span v-for="skill in shortScene.skills" :key="skill">{{ skill }}</span>
      </span>
    </span>
  </RouterLink>
</template>

<style scoped>
.short-card {
  display: grid;
  min-width: 0;
  overflow: hidden;
  color: #173f3a;
  background: rgb(255 253 248 / 78%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1rem;
  box-shadow: 0 0.65rem 1.6rem rgb(23 63 58 / 7%);
  text-decoration: none;
}

.short-card > img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.short-copy {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
}

.short-copy strong {
  font-size: 0.95rem;
  line-height: 1.25;
}

.short-copy small {
  display: -webkit-box;
  overflow: hidden;
  color: #6d817d;
  font-size: 0.7rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.short-meta {
  color: #b95431;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.03em;
}

.short-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.15rem;
}

.short-tags span {
  padding: 0.22rem 0.4rem;
  color: #456762;
  background: rgb(23 63 58 / 8%);
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 750;
}

.short-card:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.12rem;
}

@media (prefers-reduced-motion: no-preference) {
  .short-card {
    transition: transform 160ms ease;
  }

  .short-card:hover {
    transform: translateY(-2px);
  }
}
</style>
