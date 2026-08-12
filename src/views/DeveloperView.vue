<script setup lang="ts">
import { appConfig } from '@/config/app'
import {
  listConversationExperiences,
  listConversationScenarios
} from '@/scenes/conversations'
import { listAllChapters, listStories } from '@/scenes'
import { listShortScenes, listShortSceneSeries } from '@/scenes/shorts'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const diagnostics = [
  { label: '应用版本', value: appConfig.version },
  { label: '已注册故事', value: listStories().length },
  { label: '已注册章节', value: listAllChapters().length },
  { label: '已注册短情景', value: listShortScenes().length },
  { label: '短情景栏目', value: listShortSceneSeries().length },
  { label: 'DK会话课程', value: listConversationExperiences('dk-conversations').length },
  { label: '常见情景会话', value: listConversationExperiences('common-conversations').length },
  { label: 'DK子情景', value: listConversationScenarios('dk-lesson-15').length },
  { label: '当前故事', value: player.progress.storyId ?? '—' },
  { label: '当前章节', value: player.progress.chapterId ?? '—' },
  { label: '当前场景', value: player.progress.sceneId ?? '—' }
]
</script>

<template>
  <section class="page developer-page">
    <header>
      <div>
        <p class="eyebrow">Developer</p>
        <h1>开发者检查</h1>
      </div>
      <RouterLink :to="{ name: 'settings' }">退出</RouterLink>
    </header>

    <p class="developer-note">当前仅提供只读运行信息，后续检查工具会以独立模块加入。</p>

    <div class="diagnostic-grid">
      <article v-for="item in diagnostics" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>

    <article class="surface-card">
      <p class="profile-section-title">本次会话</p>
      <p class="muted">口语 {{ player.english.speaking }} · 词汇 {{ player.vocabulary.length }} · 等级 {{ player.level }}</p>
    </article>
  </section>
</template>

<style scoped>
.developer-page {
  gap: 1.25rem;
}

header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

header a {
  padding: 0.5rem 0.8rem;
  color: #173f3a;
  border: 1px solid rgb(23 63 58 / 16%);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
}

.developer-note {
  color: #456762;
  line-height: 1.65;
}

.diagnostic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.diagnostic-grid article {
  display: grid;
  gap: 0.4rem;
  min-width: 0;
  padding: 1rem;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1rem;
}

.diagnostic-grid span {
  color: #6d817d;
  font-size: 0.72rem;
  font-weight: 750;
}

.diagnostic-grid strong {
  overflow-wrap: anywhere;
  color: #173f3a;
}

@media (max-width: 24rem) {
  .diagnostic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
