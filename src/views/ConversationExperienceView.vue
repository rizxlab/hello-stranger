<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProgressiveSceneBackground from '@/components/media/ProgressiveSceneBackground.vue'
import CollapsibleChoicePanel from '@/components/conversation/CollapsibleChoicePanel.vue'
import ConversationIntro from '@/components/conversation/ConversationIntro.vue'
import ConversationFeedbackModal from '@/components/conversation/ConversationFeedbackModal.vue'
import ConversationTranscript from '@/components/conversation/ConversationTranscript.vue'
import ScenarioNavigator from '@/components/conversation/ScenarioNavigator.vue'
import { useConversationSession } from '@/composables/useConversationSession'
import { getBackgroundResource } from '@/config/storyResources'
import {
  loadConversationExperience,
  listConversationScenarios
} from '@/scenes/conversations'
import { getShortSceneSeries } from '@/scenes/shorts'
import { getThemeCategory } from '@/scenes/themes'
import { getNextConversationExperienceId } from '@/systems/ConversationNavigationSystem'

const route = useRoute()
const router = useRouter()
const session = useConversationSession()
const scrollArea = ref<HTMLElement | null>(null)
const isLoading = ref(false)
let loadRequestId = 0

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

const seriesId = computed(() => routeParam(route.params.seriesId))
const experienceId = computed(() => routeParam(route.params.experienceId))
const series = computed(() => getShortSceneSeries(seriesId.value))
const theme = computed(() => getThemeCategory(seriesId.value))
const collection = computed(() => theme.value ?? series.value)
const background = computed(() =>
  getBackgroundResource(session.currentScenario.value?.background ?? '')
)
const nextBackgrounds = computed(() => {
  const nextScenario = session.scenarios.value[
    session.currentScenarioIndex.value + 1
  ]
  return nextScenario
    ? [getBackgroundResource(nextScenario.background)]
    : []
})
const scenarioPosition = computed(
  () => `${session.currentScenarioIndex.value + 1} / ${session.scenarios.value.length}`
)
const experienceKindLabel = computed(() =>
  session.experience.value?.kind === 'lesson'
    ? `Lesson ${session.experience.value.number}`
    : collection.value?.experienceLabel ?? 'Conversation'
)
const directoryRoute = computed(() => ({
  name: theme.value
    ? 'theme-category' as const
    : 'short-scene-series' as const,
  params: theme.value
    ? { themeId: seriesId.value }
    : { seriesId: seriesId.value }
}))
const directoryLabel = computed(() =>
  session.experience.value?.kind === 'lesson' ? '课程目录' : '会话目录'
)
const nextExperienceId = computed(() =>
  getNextConversationExperienceId(seriesId.value, experienceId.value)
)
function selectedScenarioId(): string | undefined {
  const value = route.query.scenario
  const scenarioId = Array.isArray(value) ? value[0] : value
  return scenarioId || undefined
}

async function loadSelectedExperience(): Promise<void> {
  const requestId = ++loadRequestId
  session.clear()
  isLoading.value = true
  try {
    const selectedExperience = await loadConversationExperience(
      seriesId.value,
      experienceId.value
    )
    if (requestId !== loadRequestId) return
    if (!selectedExperience) return

    const scenarios = listConversationScenarios(selectedExperience.id)
    try {
      session.loadExperience(selectedExperience, scenarios, selectedScenarioId())
    } catch {
      session.loadExperience(selectedExperience, scenarios)
    }
  } catch {
    if (requestId === loadRequestId) session.clear()
  } finally {
    if (requestId === loadRequestId) isLoading.value = false
  }
}

function restartCurrentScenario(): void {
  session.restartScenario()
}

function goToScenario(scenarioId: string): void {
  void router.replace({
    query: { ...route.query, scenario: scenarioId }
  })
}

function goToNextScenario(): void {
  const nextScenario = session.scenarios.value[
    session.currentScenarioIndex.value + 1
  ]
  if (nextScenario) {
    goToScenario(nextScenario.id)
  }
}

function goToNextConversation(): void {
  if (!nextExperienceId.value) return

  void router.push({
    name: theme.value
      ? 'theme-conversation-experience'
      : 'conversation-experience',
    params: {
      seriesId: seriesId.value,
      experienceId: nextExperienceId.value
    }
  })
}

watch(
  () => [route.params.seriesId, route.params.experienceId, route.query.scenario],
  () => void loadSelectedExperience(),
  { immediate: true }
)

watch(
  () => session.transcript.value.length,
  async () => {
    await nextTick()
    scrollArea.value?.scrollTo({ top: scrollArea.value.scrollHeight, behavior: 'smooth' })
  }
)
</script>

<template>
  <section class="conversation-page">
    <div v-if="isLoading" class="empty-state">
      <p>正在加载英语会话……</p>
    </div>

    <div v-else-if="session.phase.value === 'empty'" class="empty-state">
      <p>没有找到这个英语会话。</p>
      <RouterLink :to="directoryRoute">返回{{ collection?.title ?? '会话' }}目录</RouterLink>
    </div>

    <template v-else-if="session.currentScenario.value && session.experience.value">
      <ProgressiveSceneBackground
        class="background"
        :source="background"
        :preload-sources="nextBackgrounds"
        :alt="session.currentScenario.value.title"
      />
      <div class="shade" aria-hidden="true"></div>

      <header class="lesson-header">
        <span>{{ experienceKindLabel }} · 情景 {{ scenarioPosition }}</span>
        <strong>{{ session.experience.value.title }}</strong>
      </header>

      <div class="top-actions">
        <RouterLink :to="directoryRoute">{{ directoryLabel }}</RouterLink>
        <ScenarioNavigator
          :scenarios="session.scenarios.value"
          :current-scenario-id="session.currentScenario.value.id"
          @select="goToScenario"
        />
      </div>

      <div class="scenario-intro">
        <ConversationIntro
          :scenario-number="session.currentScenarioIndex.value + 1"
          :title="session.currentScenario.value.title"
          :setting="session.currentScenario.value.setting"
          :learning-goals="session.currentScenario.value.learningGoals"
          :compact="session.phase.value !== 'intro'"
          @start="session.beginScenario"
        />
      </div>

      <div
        v-if="session.phase.value !== 'intro'"
        ref="scrollArea"
        class="conversation-content scrollbar-dark"
        role="region"
        aria-label="连续英语会话"
        tabindex="0"
      >
        <ConversationTranscript
          :scenario="session.currentScenario.value"
          :entries="session.transcript.value"
        />
      </div>

      <aside
        v-if="session.phase.value !== 'intro' && session.phase.value !== 'feedback'"
        class="interaction-dock scrollbar-dark"
        aria-label="当前互动"
      >
        <article
          v-if="session.phase.value === 'scenario-complete'"
          class="complete-card"
        >
          <p class="eyebrow">Scenario complete</p>
          <h2>完成情景 {{ String(session.currentScenarioIndex.value + 1).padStart(2, '0') }}</h2>
          <p>你已经完成了“{{ session.currentScenario.value.title }}”这段小会话。</p>
          <div class="complete-actions">
            <button v-if="session.hasNextScenario.value" type="button" @click="goToNextScenario">下一个情景</button>
            <button v-else-if="nextExperienceId" type="button" @click="goToNextConversation">下一个对话</button>
            <button v-else type="button" @click="restartCurrentScenario">重新体验</button>
            <RouterLink :to="directoryRoute">返回{{ directoryLabel }}</RouterLink>
          </div>
        </article>

        <CollapsibleChoicePanel
          v-else-if="session.phase.value === 'choice' && session.currentChoiceTurn.value"
          :key="session.currentChoiceTurn.value.id"
          :prompt="session.currentChoiceTurn.value.prompt"
          :choices="session.currentChoiceTurn.value.choices"
          @select="session.selectChoice"
        />

      </aside>

      <ConversationFeedbackModal
        v-if="session.phase.value === 'feedback' && session.choiceResult.value"
        :expression="session.choiceResult.value.expression"
        :feedback="session.choiceResult.value.feedback"
        @back="session.returnToChoice"
        @continue="session.continueAfterFeedback"
      />
    </template>
  </section>
</template>

<style scoped>
.conversation-page {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  color: #fffaf2;
  background: #173f3a;
  isolation: isolate;
}

.background,
.shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.shade {
  z-index: 1;
  background: linear-gradient(to bottom, rgb(15 37 34 / 34%), rgb(15 37 34 / 16%) 35%, rgb(15 37 34 / 62%));
}

.lesson-header,
.top-actions,
.scenario-intro,
.conversation-content,
.interaction-dock {
  position: absolute;
  z-index: 2;
}

.scenario-intro {
  top: calc(max(0.75rem, env(safe-area-inset-top)) + 3.8rem);
  right: max(0.75rem, env(safe-area-inset-right));
  left: max(0.75rem, env(safe-area-inset-left));
  width: min(calc(100% - 1.5rem), 42rem);
  margin-inline: auto;
}

.lesson-header {
  top: max(0.75rem, env(safe-area-inset-top));
  left: max(0.75rem, env(safe-area-inset-left));
  display: grid;
  gap: 0.12rem;
  max-width: 48%;
  padding: 0.48rem 0.7rem;
  background: rgb(23 63 58 / 66%);
  border: 1px solid rgb(255 250 242 / 18%);
  border-radius: 0.8rem;
  backdrop-filter: blur(0.7rem);
}

.lesson-header span {
  color: rgb(255 250 242 / 66%);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.lesson-header strong {
  overflow: hidden;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-actions {
  top: max(0.75rem, env(safe-area-inset-top));
  right: max(0.75rem, env(safe-area-inset-right));
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.top-actions > a {
  padding: 0.62rem 0.8rem;
  background: rgb(23 63 58 / 66%);
  border: 1px solid rgb(255 250 242 / 20%);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  text-decoration: none;
  backdrop-filter: blur(0.7rem);
}

.conversation-content {
  top: clamp(10.75rem, 24vh, 13rem);
  right: max(0.75rem, env(safe-area-inset-right));
  left: max(0.75rem, env(safe-area-inset-left));
  display: grid;
  align-content: start;
  width: min(calc(100% - 1.5rem), 42rem);
  height: clamp(10rem, 32vh, 19rem);
  margin-inline: auto;
  padding: 0.15rem 0.35rem 0.5rem 0.1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.interaction-dock {
  right: max(0.75rem, env(safe-area-inset-right));
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  left: max(0.75rem, env(safe-area-inset-left));
  display: grid;
  justify-items: stretch;
  width: min(calc(100% - 1.5rem), 42rem);
  max-height: min(44vh, 26rem);
  margin-inline: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

.conversation-content:focus-visible {
  outline: 0.12rem solid rgb(255 250 242 / 50%);
  outline-offset: 0.25rem;
  border-radius: 1rem;
}

.complete-card {
  display: grid;
  gap: 0.85rem;
  padding: clamp(1.2rem, 5vw, 1.7rem);
  color: #173f3a;
  background: rgb(255 253 248 / 82%);
  border-radius: 1.3rem;
  box-shadow: 0 1rem 2.5rem rgb(15 37 34 / 22%);
  backdrop-filter: blur(1rem);
}

.complete-card h2 {
  margin: 0;
}

.complete-card > p:not(.eyebrow) {
  color: #456762;
  line-height: 1.6;
}

.complete-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.complete-actions button,
.complete-actions a {
  padding: 0.68rem 0.9rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
}

.complete-actions button {
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  cursor: pointer;
}

.complete-actions a {
  border: 1px solid rgb(23 63 58 / 18%);
}

.empty-state {
  display: grid;
  place-content: center;
  gap: 1rem;
  height: 100%;
  padding: 1.5rem;
  text-align: center;
}

.empty-state a {
  font-weight: 800;
}

@media (max-width: 31rem) {
  .lesson-header {
    max-width: 42%;
  }
}
</style>
