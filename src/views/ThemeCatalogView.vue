<script setup lang="ts">
import CollectionCatalogCard from '@/components/catalog/CollectionCatalogCard.vue'
import { listThemeCategories } from '@/scenes/themes'

const themes = listThemeCategories()
</script>

<template>
  <section class="page theme-page">
    <header class="theme-header">
      <p class="eyebrow">Everyday themes</p>
      <h1>主题分类</h1>
    </header>

    <section class="catalog-section">
      <div class="section-heading">
        <span>生活主题</span>
        <small>按编号持续扩展</small>
      </div>
      <div class="theme-grid">
        <CollectionCatalogCard
          v-for="theme in themes"
          :key="theme.id"
          :item="theme"
          :to="{ name: 'theme-category', params: { themeId: theme.id } }"
          compact
        />
      </div>
    </section>
  </section>
</template>

<style scoped>
.theme-page,
.theme-header {
  gap: 0.8rem;
}

.theme-header {
  display: grid;
}

.theme-header h1 {
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

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}
</style>
