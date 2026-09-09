<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ThemeSectionAccordion from '@/components/catalog/ThemeSectionAccordion.vue'
import { useThemeDirectoryAccordion } from '@/composables/useThemeDirectoryAccordion'
import { getThemeCategory, listThemeSections } from '@/scenes/themes'

const route = useRoute()
function routeParam(
  value: string | null | (string | null)[] | undefined
): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

const themeId = computed(() => routeParam(route.params.themeId))
const {
  expandedSectionId,
  expandedTopicId,
  setExpandedPath,
  toggleSection,
  toggleTopic
} = useThemeDirectoryAccordion(themeId)
const theme = computed(() => getThemeCategory(themeId.value))
const sections = computed(() => listThemeSections(themeId.value))

watch(
  () => [themeId.value, route.query.section, route.query.topic] as const,
  ([, sectionQuery, topicQuery]) => {
    const sectionId = routeParam(sectionQuery)
    const topicId = routeParam(topicQuery)
    if (sectionId || topicId) setExpandedPath(sectionId, topicId)
  },
  { immediate: true }
)
</script>

<template>
  <section class="page directory-page">
    <header v-if="theme" class="directory-header">
      <RouterLink :to="{ name: 'themes' }" class="back-link">← 主题分类</RouterLink>
      <p class="eyebrow">{{ theme.catalogNumber }} · {{ theme.eyebrow }}</p>
      <h1>{{ theme.title }}</h1>
      <small>共 {{ sections.length }} 个分类目录</small>
    </header>

    <div v-if="theme" class="section-list">
      <ThemeSectionAccordion
        v-for="item in sections"
        :key="item.id"
        :theme-id="theme.id"
        :section="item"
        :expanded="expandedSectionId === item.id"
        :expanded-topic-id="expandedSectionId === item.id ? expandedTopicId : null"
        @toggle="toggleSection"
        @toggle-topic="toggleTopic"
      />
    </div>

    <div v-else class="empty-directory">
      <p>没有找到这个主题目录。</p>
      <RouterLink :to="{ name: 'themes' }">返回主题分类</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.directory-page,
.directory-header {
  gap: 0.75rem;
}

.directory-header {
  display: grid;
}

.directory-header h1 {
  max-width: 24ch;
  font-size: clamp(1.7rem, 6.5vw, 2.8rem);
  line-height: 1.08;
}

.directory-header small {
  color: #b95431;
  font-size: 0.68rem;
  font-weight: 800;
}

.back-link {
  width: fit-content;
  margin-bottom: 0.3rem;
  color: #456762;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
}

.section-list {
  display: grid;
  gap: 0.58rem;
  margin-top: 0.45rem;
}

.empty-directory {
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgb(255 252 246 / 82%);
}

</style>
