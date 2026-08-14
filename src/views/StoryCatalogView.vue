<script setup lang="ts">
import { getCoverResource } from '@/config/storyResources'
import { listStories } from '@/scenes'

const stories = listStories()
</script>

<template>
  <section class="page catalog-page">
    <header class="catalog-header">
      <p class="eyebrow">Stories</p>
      <h1>剧情目录</h1>
      <p class="lead">选择一个故事，再从章节目录开始体验。</p>
    </header>

    <div v-if="stories.length" class="story-list">
      <RouterLink
        v-for="story in stories"
        :key="story.id"
        :to="{ name: 'story-chapters', params: { storyId: story.id } }"
        class="story-card"
      >
        <div
          class="story-cover"
          :style="{
            backgroundImage: getCoverResource(story.cover).backgroundImage
          }"
        >
          <span aria-hidden="true">{{ story.title.charAt(0) }}</span>
        </div>
        <div class="story-info">
          <p class="story-kicker">Story</p>
          <h2>{{ story.title }}</h2>
          <p v-if="story.description">{{ story.description }}</p>
          <span class="story-action">查看章节 →</span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="surface-card">
      <p>还没有故事。</p>
      <p class="muted">新增故事目录后，它会自动显示在这里。</p>
    </div>
  </section>
</template>

<style scoped>
.catalog-page,
.catalog-header {
  gap: 1rem;
}

.catalog-header {
  display: grid;
}

.story-list {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
}

.story-card {
  display: grid;
  grid-template-columns: minmax(5rem, 28%) 1fr;
  min-height: 9rem;
  overflow: hidden;
  background: rgb(255 253 248 / 76%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1.25rem;
  text-decoration: none;
  box-shadow: 0 0.8rem 2rem rgb(23 63 58 / 8%);
}

.story-cover {
  display: grid;
  place-items: center;
  color: rgb(255 250 242 / 78%);
  background-position: center;
  background-size: cover;
  font-size: clamp(2rem, 12vw, 4rem);
  font-weight: 850;
}

.story-info {
  display: grid;
  align-content: center;
  gap: 0.4rem;
  padding: clamp(1rem, 4vw, 1.4rem);
}

.story-info h2,
.story-info p {
  margin: 0;
}

.story-info h2 {
  font-size: clamp(1.35rem, 5vw, 2rem);
}

.story-info > p:not(.story-kicker) {
  color: #6d817d;
  line-height: 1.5;
}

.story-kicker,
.story-action {
  color: #b95431;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.story-action {
  margin-top: 0.5rem;
}

.story-card:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.2rem;
}

@media (max-width: 24rem) {
  .story-card {
    grid-template-columns: 1fr;
  }

  .story-cover {
    min-height: 7rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .story-card {
    transition: transform 160ms ease;
  }

  .story-card:hover {
    transform: translateY(-2px);
  }
}
</style>
