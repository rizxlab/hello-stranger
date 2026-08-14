<script setup lang="ts">
import ShortSceneCard from '@/components/shorts/ShortSceneCard.vue'
import { getBackgroundResource } from '@/config/storyResources'
import { listShortScenes, listShortSceneSeries } from '@/scenes/shorts'

const series = listShortSceneSeries()
const shortScenes = listShortScenes(null)
</script>

<template>
  <section class="page short-page">
    <header class="short-header">
      <p class="eyebrow">Quick scenes</p>
      <h1>短情景</h1>
      <p class="lead">用两三分钟，练习一个马上能用的英语场景。</p>
    </header>

    <section v-if="series.length" class="catalog-section">
      <div class="section-heading">
        <span>会话栏目</span>
        <small>按系列持续更新</small>
      </div>
      <div class="series-grid">
        <RouterLink
          v-for="item in series"
          :key="item.id"
          :to="{ name: 'short-scene-series', params: { seriesId: item.id } }"
          class="series-card"
        >
          <img :src="getBackgroundResource(item.cover).url" :alt="item.title" />
          <span class="series-copy">
            <small>{{ item.eyebrow }}</small>
            <strong>{{ item.title }}</strong>
            <span>{{ item.summary }}</span>
            <b>查看全部会话 →</b>
          </span>
        </RouterLink>
      </div>
    </section>

    <section v-if="shortScenes.length" class="catalog-section">
      <div class="section-heading">
        <span>独立短情景</span>
        <small>单次快速练习</small>
      </div>
    <div class="short-grid">
      <ShortSceneCard
        v-for="shortScene in shortScenes"
        :key="shortScene.id"
        :short-scene="shortScene"
      />
    </div>
    </section>
  </section>
</template>

<style scoped>
.short-page,
.short-header {
  gap: 0.8rem;
}

.short-header {
  display: grid;
}

.short-header h1 {
  font-size: clamp(2.5rem, 11vw, 4.5rem);
}

.catalog-section {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.4rem;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: #173f3a;
}

.section-heading span {
  font-weight: 850;
}

.section-heading small {
  color: #6d817d;
  font-size: 0.65rem;
}

.series-grid {
  display: grid;
  gap: 0.7rem;
}

.series-card {
  position: relative;
  display: grid;
  min-height: 11rem;
  overflow: hidden;
  color: #fffaf2;
  border-radius: 1.2rem;
  box-shadow: 0 0.75rem 1.8rem rgb(23 63 58 / 13%);
  text-decoration: none;
}

.series-card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(15 37 34 / 88%), rgb(15 37 34 / 22%));
  content: '';
}

.series-card img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.series-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: center;
  gap: 0.35rem;
  width: min(76%, 24rem);
  padding: 1.2rem;
}

.series-copy small {
  color: #f0a181;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.series-copy strong {
  font-size: clamp(1.25rem, 5vw, 1.75rem);
}

.series-copy > span {
  color: rgb(255 250 242 / 76%);
  font-size: 0.72rem;
  line-height: 1.5;
}

.series-copy b {
  margin-top: 0.35rem;
  font-size: 0.68rem;
}

.short-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.4rem;
}

.series-card:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.12rem;
}

@media (min-width: 44rem) {
  .short-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .series-card {
    transition: transform 160ms ease;
  }

  .series-card:hover {
    transform: translateY(-2px);
  }
}
</style>
