<script setup lang="ts">
import CollectionCatalogCard from '@/components/catalog/CollectionCatalogCard.vue'
import ShortSceneCard from '@/components/shorts/ShortSceneCard.vue'
import { listShortScenes, listShortSceneSeries } from '@/scenes/shorts'

const series = listShortSceneSeries()
const shortScenes = listShortScenes(null)
</script>

<template>
  <section class="page short-page">
    <header class="short-header">
      <p class="eyebrow">Quick scenes</p>
      <h1>短情景</h1>
    </header>

    <section v-if="series.length" class="catalog-section">
      <div class="section-heading">
        <span>会话栏目</span>
        <small>按系列持续更新</small>
      </div>
      <div class="series-grid">
        <CollectionCatalogCard
          v-for="item in series"
          :key="item.id"
          :item="item"
          :to="{ name: 'short-scene-series', params: { seriesId: item.id } }"
        />
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
  font-size: clamp(2rem, 8vw, 3.25rem);
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

.short-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.4rem;
}

@media (min-width: 44rem) {
  .short-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

</style>
