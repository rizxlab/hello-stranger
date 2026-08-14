<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getStory, listChapters } from '@/scenes'

const route = useRoute()
const storyId = computed(() => {
  const value = route.params.storyId
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
})
const story = computed(() => getStory(storyId.value))
const chapters = computed(() => listChapters(storyId.value))
</script>

<template>
  <section class="page chapter-page">
    <RouterLink :to="{ name: 'stories' }" class="back-link">
      ← 返回剧情目录
    </RouterLink>

    <template v-if="story">
      <header class="chapter-header">
        <p class="eyebrow">Story</p>
        <h1>{{ story.title }}</h1>
        <p v-if="story.description" class="lead">{{ story.description }}</p>
      </header>

      <div v-if="chapters.length" class="chapter-list">
        <RouterLink
          v-for="chapter in chapters"
          :key="chapter.id"
          :to="{
            name: 'play',
            params: { storyId: story.id, chapterId: chapter.id }
          }"
          class="chapter-card"
        >
          <span class="chapter-number">
            {{ String(chapter.chapterNumber).padStart(2, '0') }}
          </span>
          <span class="chapter-copy">
            <strong>{{ chapter.title }}</strong>
            <small v-if="chapter.summary">{{ chapter.summary }}</small>
          </span>
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <div v-else class="surface-card empty-chapters">
        <p>这个故事还没有章节。</p>
        <p class="muted">章节 JSON 加入后会自动显示在这里。</p>
      </div>
    </template>

    <div v-else class="surface-card">
      <p>没有找到这个故事。</p>
      <p class="muted">它可能已被移除或尚未加入目录。</p>
    </div>
  </section>
</template>

<style scoped>
.chapter-page,
.chapter-header {
  gap: 1rem;
}

.chapter-header {
  display: grid;
}

.back-link {
  width: fit-content;
  color: #456762;
  font-size: 0.8rem;
  font-weight: 750;
  text-decoration: none;
}

.chapter-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.chapter-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.9rem;
  min-height: 5rem;
  padding: 0.85rem 1rem;
  background: rgb(255 253 248 / 78%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1rem;
  text-decoration: none;
}

.chapter-number {
  display: grid;
  place-items: center;
  width: 2.6rem;
  aspect-ratio: 1;
  color: #fffaf2;
  background: #173f3a;
  border-radius: 50%;
  font-size: 0.78rem;
  font-weight: 850;
}

.chapter-copy {
  display: grid;
  gap: 0.25rem;
}

.chapter-copy small {
  color: #6d817d;
  line-height: 1.45;
}

.chapter-card:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.15rem;
}

.empty-chapters {
  margin-top: 0.5rem;
}

@media (prefers-reduced-motion: no-preference) {
  .chapter-card {
    transition: transform 160ms ease;
  }

  .chapter-card:hover {
    transform: translateY(-2px);
  }
}
</style>
