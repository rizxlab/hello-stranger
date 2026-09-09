<script setup lang="ts">
import type { ThemeSectionDefinition } from '@/scenes/themes/types'

const props = defineProps<{
  themeId: string
  section: ThemeSectionDefinition
  expanded: boolean
  expandedTopicId: string | null
}>()

const emit = defineEmits<{
  toggle: [sectionId: string]
  toggleTopic: [topicId: string]
}>()

const panelId = `theme-section-${props.section.id.replaceAll('.', '-')}`

function topicPanelId(topicId: string): string {
  return `theme-topic-${topicId.replaceAll('.', '-')}`
}
</script>

<template>
  <article class="section-accordion" :class="{ 'section-accordion--expanded': expanded }">
    <button
      type="button"
      class="section-trigger"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      @click="emit('toggle', section.id)"
    >
      <b>{{ section.number }}</b>
      <span class="section-copy">
        <strong>{{ section.title }}</strong>
        <small>{{ section.topics.length }} 个情景目录</small>
      </span>
      <span class="section-action" aria-hidden="true">
        {{ expanded ? '收起' : '展开' }}
        <i>⌄</i>
      </span>
    </button>

    <Transition name="section-expand">
      <div v-if="expanded" :id="panelId" class="section-panel">
        <article
          v-for="topic in section.topics"
          :key="topic.id"
          class="topic-accordion"
          :class="{ 'topic-accordion--expanded': expandedTopicId === topic.id }"
        >
          <button
            type="button"
            class="topic-trigger"
            :aria-expanded="expandedTopicId === topic.id"
            :aria-controls="topicPanelId(topic.id)"
            @click="emit('toggleTopic', topic.id)"
          >
            <b>{{ topic.number }}</b>
            <span class="topic-copy">
              <strong>{{ topic.title }}</strong>
              <small>{{ topic.chapters.length }} 个剧情章节</small>
            </span>
            <span class="topic-action" aria-hidden="true">
              {{ expandedTopicId === topic.id ? '收起' : '展开' }}
              <i>⌄</i>
            </span>
          </button>

          <Transition name="topic-expand">
            <div
              v-if="expandedTopicId === topic.id"
              :id="topicPanelId(topic.id)"
              class="chapter-list"
            >
              <component
                :is="
                  chapter.status === 'available' && chapter.experienceId
                    ? 'RouterLink'
                    : 'article'
                "
                v-for="chapter in topic.chapters"
                :key="chapter.id"
                :to="
                  chapter.status === 'available' && chapter.experienceId
                    ? {
                        name: 'theme-conversation-experience',
                        params: {
                          seriesId: themeId,
                          experienceId: chapter.experienceId
                        },
                        query: chapter.scenarioId
                          ? { scenario: chapter.scenarioId }
                          : undefined
                      }
                    : undefined
                "
                class="chapter-row"
                :class="{ 'chapter-row--planned': chapter.status === 'planned' }"
              >
                <b>{{ chapter.code }}</b>
                <strong>{{ chapter.title }}</strong>
                <small>
                  {{ chapter.status === 'available' ? '开始体验 →' : '待制作' }}
                </small>
              </component>
            </div>
          </Transition>
        </article>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.section-accordion {
  overflow: hidden;
  background: rgb(255 252 246 / 88%);
  border: 1px solid rgb(23 63 58 / 10%);
  border-radius: 1rem;
  box-shadow: 0 0.55rem 1.3rem rgb(23 63 58 / 7%);
}

.section-trigger,
.topic-trigger {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  color: #173f3a;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.section-trigger {
  padding: 0.82rem 0.9rem;
}

.section-trigger > b {
  display: inline-grid;
  min-width: 2.7rem;
  min-height: 1.65rem;
  padding: 0.2rem 0.48rem;
  color: #fffaf2;
  background: #d86f45;
  border-radius: 999px;
  font-size: 0.62rem;
  place-items: center;
}

.section-copy,
.topic-copy {
  display: grid;
  min-width: 0;
  gap: 0.12rem;
}

.section-copy strong {
  overflow-wrap: anywhere;
  font-size: clamp(0.86rem, 3.5vw, 1.05rem);
  line-height: 1.25;
}

.section-copy small,
.topic-copy small {
  color: #738783;
  font-size: 0.58rem;
}

.section-action,
.topic-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #b95431;
  font-size: 0.6rem;
  font-weight: 850;
}

.section-action i,
.topic-action i {
  font-size: 0.9rem;
  font-style: normal;
  transition: transform 180ms ease;
}

.section-accordion--expanded > .section-trigger .section-action i,
.topic-accordion--expanded > .topic-trigger .topic-action i {
  transform: rotate(180deg);
}

.section-panel {
  display: grid;
  gap: 0.45rem;
  padding: 0.65rem;
  border-top: 1px solid rgb(23 63 58 / 8%);
}

.topic-accordion {
  overflow: hidden;
  background: rgb(239 235 226 / 68%);
  border: 1px solid transparent;
  border-radius: 0.78rem;
}

.topic-accordion--expanded {
  border-color: rgb(216 111 69 / 20%);
}

.topic-trigger {
  padding: 0.68rem 0.72rem;
}

.topic-trigger > b {
  color: #b95431;
  font-size: 0.58rem;
}

.topic-copy strong {
  overflow-wrap: anywhere;
  font-size: clamp(0.75rem, 3.1vw, 0.92rem);
  line-height: 1.3;
}

.chapter-list {
  display: grid;
  gap: 0.38rem;
  padding: 0 0.55rem 0.55rem;
}

.chapter-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  padding: 0.62rem 0.68rem;
  color: #173f3a;
  background: rgb(255 252 246 / 90%);
  border: 1px solid rgb(23 63 58 / 8%);
  border-radius: 0.7rem;
  text-decoration: none;
}

.chapter-row > b {
  display: inline-grid;
  min-width: 1.55rem;
  min-height: 1.55rem;
  color: #fffaf2;
  background: #d86f45;
  border-radius: 999px;
  font-size: 0.58rem;
  place-items: center;
}

.chapter-row > strong {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: clamp(0.72rem, 3vw, 0.88rem);
  line-height: 1.28;
}

.chapter-row > small {
  color: #b95431;
  font-size: 0.56rem;
  font-weight: 800;
  white-space: nowrap;
}

.chapter-row--planned {
  opacity: 0.68;
}

.chapter-row--planned > small {
  color: #738783;
}

.section-trigger:focus-visible,
.topic-trigger:focus-visible,
.chapter-row:focus-visible {
  outline: 0.18rem solid #d86f45;
  outline-offset: -0.12rem;
}

.section-expand-enter-active,
.section-expand-leave-active,
.topic-expand-enter-active,
.topic-expand-leave-active {
  max-height: 80rem;
  overflow: hidden;
  transition:
    max-height 240ms ease,
    opacity 160ms ease,
    transform 180ms ease;
}

.section-expand-enter-from,
.section-expand-leave-to,
.topic-expand-enter-from,
.topic-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.2rem);
}

@media (max-width: 34rem) {
  .section-trigger,
  .topic-trigger {
    gap: 0.55rem;
  }

  .topic-action {
    font-size: 0;
  }

  .topic-action i {
    font-size: 0.78rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-action i,
  .topic-action i,
  .section-expand-enter-active,
  .section-expand-leave-active,
  .topic-expand-enter-active,
  .topic-expand-leave-active {
    transition: none;
  }
}
</style>
