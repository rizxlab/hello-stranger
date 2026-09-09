<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ShortSceneCard from '@/components/shorts/ShortSceneCard.vue'
import { getBackgroundResource } from '@/config/storyResources'
import {
  listConversationExperiences,
  listConversationScenarios
} from '@/scenes/conversations'
import { getShortSceneSeries, listShortScenes } from '@/scenes/shorts'
import {
  imagePreloadService,
  selectPreferredImageUrl
} from '@/services/ImagePreloadService'

const route = useRoute()
const seriesId = computed(() => {
  const value = route.params.seriesId
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
})
const series = computed(() => getShortSceneSeries(seriesId.value))
const collection = series
const contentType = computed(() => series.value?.contentType)
const shortScenes = computed(() => listShortScenes(seriesId.value))
const experiences = computed(() => listConversationExperiences(seriesId.value))
const itemCount = computed(() =>
  contentType.value === 'conversation-experiences'
    ? experiences.value.length
    : shortScenes.value.length
)
const itemLabel = computed(() =>
  experiences.value.length > 0 &&
  experiences.value.every((experience) => experience.kind === 'lesson')
    ? '课程'
    : '会话'
)
const allStandalone = computed(() =>
  experiences.value.length > 0 &&
  experiences.value.every((experience) => experience.kind === 'standalone')
)
const isDenseLessonSeries = computed(
  () => series.value?.id === 'dk-conversations'
)
const parentRoute = { name: 'short-scenes' as const }
const parentLabel = '短情景'
const conversationRouteName = 'conversation-experience' as const

function preloadExperienceBackground(
  experienceId: string,
  fallbackResourceKey: string
): void {
  const firstScenario = listConversationScenarios(experienceId)[0]
  const resourceKey = firstScenario?.background ?? fallbackResourceKey
  const resource = getBackgroundResource(resourceKey)
  const url = selectPreferredImageUrl(resource.url, resource.portraitUrl)
  void imagePreloadService.load(url, { priority: 'low' }).catch(() => undefined)
}
</script>

<template>
  <section class="page series-page">
    <header v-if="collection" class="series-header">
      <RouterLink :to="parentRoute" class="back-link">← {{ parentLabel }}</RouterLink>
      <p class="eyebrow">
        {{ collection.eyebrow }}
      </p>
      <h1>{{ collection.title }}</h1>
      <small>共 {{ itemCount }} 个{{ contentType === 'conversation-experiences' ? itemLabel : '会话' }}</small>
    </header>

    <div
      v-if="contentType === 'conversation-experiences' && experiences.length"
      class="lesson-grid"
      :class="{
        'lesson-grid--standalone': allStandalone,
        'lesson-grid--dense': isDenseLessonSeries
      }"
    >
      <RouterLink
        v-for="experience in experiences"
        :key="experience.id"
        :to="{
          name: conversationRouteName,
          params: { seriesId: collection?.id, experienceId: experience.id }
        }"
        class="lesson-card"
        @pointerenter="preloadExperienceBackground(experience.id, experience.cover)"
        @focus="preloadExperienceBackground(experience.id, experience.cover)"
        @touchstart.passive="preloadExperienceBackground(experience.id, experience.cover)"
      >
        <img
          :src="getBackgroundResource(experience.cover).url"
          :alt="experience.kind === 'lesson' ? `${experience.number} ${experience.title}` : experience.title"
          loading="lazy"
          decoding="async"
        />
        <span class="lesson-number">
          {{ experience.kind === 'lesson' ? `Lesson ${experience.number}` : '常见会话' }}
        </span>
        <span class="lesson-copy">
          <strong>{{ experience.kind === 'lesson' ? `${experience.number} ${experience.title}` : experience.title }}</strong>
          <small>{{ experience.summary }}</small>
          <b>{{ experience.kind === 'lesson' ? '开始课程' : '开始会话' }} →</b>
        </span>
      </RouterLink>
    </div>

    <div
      v-else-if="collection && contentType === 'conversation-experiences'"
      class="empty-series"
    >
      <p>{{ collection.title }}的独立会话内容将持续加入。</p>
      <small>以后新增会话数据后，会自动显示在这个目录中。</small>
    </div>

    <div v-else-if="collection" class="short-grid">
      <ShortSceneCard
        v-for="shortScene in shortScenes"
        :key="shortScene.id"
        :short-scene="shortScene"
      />
    </div>

    <div v-else class="empty-series">
      <p>没有找到这个会话栏目。</p>
      <RouterLink :to="parentRoute">返回{{ parentLabel }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.series-page,
.series-header {
  gap: 0.8rem;
}

.series-header {
  display: grid;
}

.series-header h1 {
  font-size: clamp(2rem, 8vw, 3.25rem);
}

.series-header small {
  color: #b95431;
  font-size: 0.68rem;
  font-weight: 800;
}

.series-header .eyebrow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.series-header .eyebrow b {
  display: inline-grid;
  min-width: 1.85rem;
  min-height: 1.45rem;
  padding: 0.18rem 0.4rem;
  color: #fffaf2;
  background: #d86f45;
  border-radius: 999px;
  font-size: 0.62rem;
  place-items: center;
}

.back-link {
  width: fit-content;
  margin-bottom: 0.45rem;
  color: #456762;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
}

.short-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.4rem;
}

.lesson-grid {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.4rem;
}

.lesson-grid--standalone {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lesson-grid--dense {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.lesson-grid--dense .lesson-card {
  min-height: 9.5rem;
  border-radius: 1rem;
}

.lesson-grid--dense .lesson-number {
  margin: 0.55rem;
  padding: 0.27rem 0.45rem;
  font-size: 0.55rem;
}

.lesson-grid--dense .lesson-copy {
  gap: 0.22rem;
  padding: 0.7rem;
}

.lesson-grid--dense .lesson-copy strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: clamp(0.86rem, 3.8vw, 1.1rem);
  line-height: 1.2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lesson-grid--dense .lesson-copy small {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.62rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lesson-grid--dense .lesson-copy b {
  margin-top: 0.1rem;
  font-size: 0.6rem;
}

.lesson-grid--standalone .lesson-card {
  min-height: 12rem;
}

.lesson-card {
  position: relative;
  display: grid;
  min-height: 14rem;
  overflow: hidden;
  color: #fffaf2;
  border-radius: 1.25rem;
  box-shadow: 0 0.8rem 2rem rgb(23 63 58 / 14%);
  text-decoration: none;
}

.lesson-card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(15 37 34 / 92%), rgb(15 37 34 / 10%) 78%);
  content: '';
}

.lesson-card img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lesson-number,
.lesson-copy {
  position: relative;
  z-index: 1;
}

.lesson-number {
  align-self: start;
  justify-self: start;
  margin: 0.8rem;
  padding: 0.35rem 0.55rem;
  background: rgb(23 63 58 / 62%);
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 850;
  backdrop-filter: blur(0.5rem);
}

.lesson-copy {
  align-self: end;
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
}

.lesson-copy strong {
  font-size: clamp(1.15rem, 5vw, 1.6rem);
}

.lesson-copy small {
  color: rgb(255 250 242 / 72%);
  line-height: 1.5;
}

.lesson-copy b {
  margin-top: 0.3rem;
  color: #f0a181;
  font-size: 0.68rem;
}

.empty-series {
  display: grid;
  place-items: center;
  gap: 0.8rem;
  min-height: 50vh;
  text-align: center;
}

.empty-series small {
  color: #6d817d;
  line-height: 1.6;
}

.empty-series a {
  color: #173f3a;
  font-weight: 800;
}

@media (min-width: 44rem) {
  .short-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }


  .lesson-grid--standalone {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 24rem) {
  .lesson-grid--dense .lesson-card {
    min-height: 8.75rem;
  }

  .lesson-grid--dense .lesson-copy {
    padding: 0.58rem;
  }

  .lesson-grid--dense .lesson-copy small {
    -webkit-line-clamp: 1;
  }
}
</style>
