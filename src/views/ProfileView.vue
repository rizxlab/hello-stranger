<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const skillItems = [
  { key: 'speaking', label: '口语' },
  { key: 'listening', label: '听力' },
  { key: 'reading', label: '阅读' },
  { key: 'vocabulary', label: '词汇' }
] as const
</script>

<template>
  <section class="page profile-page">
    <header class="profile-header">
      <div>
        <p class="eyebrow">Profile · Level {{ player.level }}</p>
        <h1>玩家信息</h1>
      </div>
      <RouterLink :to="{ name: 'settings' }" class="settings-link" aria-label="打开设置">
        <span aria-hidden="true">⚙</span>
        设置
      </RouterLink>
    </header>

    <div class="profile-grid">
      <article
        v-for="skill in skillItems"
        :key="skill.key"
        class="profile-stat"
      >
        <span>{{ skill.label }}</span>
        <strong>{{ player.english[skill.key] }}</strong>
      </article>
    </div>

    <article class="surface-card">
      <p class="profile-section-title">本次旅程解锁</p>
      <div v-if="player.vocabulary.length" class="vocabulary-list">
        <span v-for="word in player.vocabulary" :key="word">{{ word }}</span>
      </div>
      <p v-else class="muted">完成剧情选择后，学到的表达会显示在这里。</p>
    </article>
  </section>
</template>

<style scoped>
.profile-page {
  gap: 1.25rem;
}

.profile-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.settings-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  color: #173f3a;
  border: 1px solid rgb(23 63 58 / 16%);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.profile-stat {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(23 63 58 / 12%);
  border-radius: 1rem;
}

.profile-stat span {
  color: #6d817d;
  font-size: 0.78rem;
  font-weight: 750;
}

.profile-stat strong {
  color: #b95431;
  font-size: clamp(1.4rem, 6vw, 2rem);
}

.profile-section-title {
  font-weight: 800;
}

.vocabulary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vocabulary-list span {
  padding: 0.4rem 0.65rem;
  color: #173f3a;
  background: rgb(23 63 58 / 9%);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 750;
}

@media (max-width: 30rem) {
  .profile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
